"""Flask application factory."""

import os
from pathlib import Path

from flask import Flask, abort, send_from_directory
from flask_cors import CORS

from config import get_config
from extensions import db, migrate
from errors import ok
from games.registry import register_games, sync_games_to_db

PUBLIC_GAME_IDS = (
    "spider_solitaire",
    "klondike",
    "freecell",
    "pyramid",
    "tripeaks",
    "golf",
    "clock",
)


def create_app(config_object=None):
    frontend_dist = Path(__file__).resolve().parent.parent / "frontend" / "dist"

    app = Flask(__name__)
    app.config.from_object(config_object or get_config())
    app.config["FRONTEND_DIST_DIR"] = str(frontend_dist)
    app.json.ensure_ascii = False

    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    ensure_runtime_dirs(app)

    import models  # noqa: F401

    register_security_headers(app)
    register_health(app)
    register_blueprints(app)
    register_frontend(app)

    with app.app_context():
        register_games(app)
        try:
            sync_games_to_db(app)
        except Exception as exc:  # noqa: BLE001
            app.logger.warning("games table sync skipped before migrations: %s", exc)

    return app


def ensure_runtime_dirs(app):
    Path(app.config["UPLOAD_DIR"]).mkdir(parents=True, exist_ok=True)

    db_uri = app.config.get("SQLALCHEMY_DATABASE_URI", "")
    sqlite_prefix = "sqlite:///"
    if db_uri.startswith(sqlite_prefix):
        db_path = Path(db_uri[len(sqlite_prefix):])
        db_path.parent.mkdir(parents=True, exist_ok=True)


def register_security_headers(app):
    @app.after_request
    def _add_headers(response):
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = (
            "max-age=31536000; includeSubDomains"
        )
        return response


def register_health(app):
    @app.get("/api/health")
    def health():
        return ok({"status": "up", "service": "poker-platform"})

    @app.get("/api/uploads/<path:filename>")
    def serve_upload(filename):
        return send_from_directory(app.config["UPLOAD_DIR"], filename)

    @app.get("/api/settings")
    def public_settings():
        from models import AppSetting

        row = AppSetting.query.get("card_back_url")
        return ok({"card_back_url": row.value if row else None})

    @app.get("/api/games")
    def public_games():
        from models import Game

        rows = (
            Game.query.filter(
                Game.is_enabled.is_(True),
                Game.game_id.in_(PUBLIC_GAME_IDS),
            )
            .order_by(Game.id.asc())
            .all()
        )
        return ok(
            {
                "items": [
                    {
                        "game_id": game.game_id,
                        "name": game.name,
                        "description": game.description,
                        "icon": f"/api/games/{game.game_id}/static/icon.png",
                    }
                    for game in rows
                ]
            }
        )


def register_blueprints(app):
    from admin.routes import admin_bp
    from auth.routes import auth_bp, user_bp
    from cards.routes import cards_bp, special_bp
    from leaderboard.routes import leaderboard_bp

    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(user_bp, url_prefix="/api/user")
    app.register_blueprint(cards_bp, url_prefix="/api/cards")
    app.register_blueprint(special_bp, url_prefix="/api/special-cards")
    app.register_blueprint(leaderboard_bp, url_prefix="/api/leaderboard")
    app.register_blueprint(admin_bp, url_prefix="/api/admin")


def register_frontend(app):
    @app.get("/", defaults={"path": ""})
    @app.get("/<path:path>")
    def serve_frontend(path):
        if path.startswith("api/"):
            abort(404)

        static_root = Path(app.config["FRONTEND_DIST_DIR"])
        if path:
            candidate = static_root / path
            if candidate.is_file():
                return send_from_directory(static_root, path)
            if "." in Path(path).name:
                abort(404)

        index_file = static_root / "index.html"
        if index_file.is_file():
            return send_from_directory(static_root, "index.html")
        abort(404)


if __name__ == "__main__":
    create_app().run(host="0.0.0.0", port=int(os.environ.get("PORT", "5000")))
