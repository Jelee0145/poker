#!/bin/bash
set -e

# 部署默认值（可在 Railway Dashboard 环境变量覆盖）
export FLASK_ENV="${FLASK_ENV:-prod}"
export DATABASE_URL="${DATABASE_URL:-sqlite:///poker.db}"

echo "=== 数据库迁移 ==="
flask db upgrade

echo "=== 检测并填充占位数据 ==="
python -c "
from app import create_app
from extensions import db
from models import Card

app = create_app()
with app.app_context():
    if Card.query.count() == 0:
        import seed
        seed.seed_cards()
        seed.seed_special()
        print('占位数据已填充')
    else:
        print('数据库已有数据，跳过')
"

echo "=== 启动服务 ==="
gunicorn app:create_app --bind 0.0.0.0:$PORT
