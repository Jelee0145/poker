"""认证与用户信息路由。

  POST /api/auth/send-code   发送验证码
  POST /api/auth/login       手机号+验证码 登录/自动注册
  POST /api/auth/refresh     用 Refresh Token 换新 Access Token
  GET  /api/user/profile     获取当前用户信息(需登录)
"""
from flask import Blueprint, request, g

from errors import (
    ok, fail,
    ERR_PARAM, ERR_SMS_TOO_FREQUENT, ERR_ACCOUNT_LOCKED,
    ERR_CODE_WRONG, ERR_CODE_EXPIRED, ERR_CODE_USED, ERR_CODE_PURPOSE,
    ERR_REFRESH_INVALID,
)
from extensions import db
from models import User
from utils.jwt_util import decode_token, issue_access_token
from . import service
from .decorators import require_auth

auth_bp = Blueprint("auth", __name__)
user_bp = Blueprint("user", __name__)


def _client_ip():
    return request.headers.get("X-Forwarded-For", request.remote_addr or "")


@auth_bp.post("/send-code")
def send_code():
    body = request.get_json(silent=True) or {}
    phone = (body.get("phone") or "").strip()
    purpose = (body.get("purpose") or "login").strip()

    if not service.is_valid_phone(phone):
        return fail(ERR_PARAM, "手机号格式错误")
    # Q3:MVP 不做密码找回
    if purpose not in ("login", "register"):
        return fail(ERR_CODE_PURPOSE, "MVP 仅支持 login/register")

    allowed, retry_after = service.can_send_code(phone, purpose)
    if not allowed:
        return fail(ERR_SMS_TOO_FREQUENT, f"请 {retry_after} 秒后再试")

    expires_in = service.create_and_send_code(phone, purpose)
    return ok({"expires_in": expires_in, "next_can_send_in": 60})


@auth_bp.post("/login")
def login():
    body = request.get_json(silent=True) or {}
    phone = (body.get("phone") or "").strip()
    code = (body.get("code") or "").strip()
    purpose = (body.get("purpose") or "login").strip()
    ip = _client_ip()

    if not service.is_valid_phone(phone) or not code:
        return fail(ERR_PARAM, "手机号或验证码格式错误")
    if purpose not in ("login", "register"):
        return fail(ERR_CODE_PURPOSE)

    # Q5:登录锁定独立判断
    if service.is_locked(phone):
        return fail(ERR_ACCOUNT_LOCKED)

    status, record = service.verify_code(phone, code, purpose)
    if status != service.CODE_OK:
        service.record_attempt(phone, success=False, ip=ip)
        return fail({
            service.CODE_NOT_FOUND: ERR_CODE_WRONG,
            service.CODE_WRONG: ERR_CODE_WRONG,
            service.CODE_EXPIRED: ERR_CODE_EXPIRED,
            service.CODE_USED: ERR_CODE_USED,
        }[status])

    # 验证码作废 + 记录成功(重置失败计数)
    record.is_used = True
    db.session.commit()
    service.record_attempt(phone, success=True, ip=ip)

    user = service.get_or_create_user(phone)
    tokens = service.issue_tokens(user)
    return ok({
        **tokens,
        "user": {
            "id": user.id,
            "phone": user.phone,
            "role": user.role,
            "points": user.points,
            "nickname": user.nickname,
        },
    })


@auth_bp.post("/refresh")
def refresh():
    auth_header = request.headers.get("Authorization", "")
    token = auth_header[7:].strip() if auth_header.startswith("Bearer ") else ""
    if not token:
        return fail(ERR_REFRESH_INVALID)

    payload, err = decode_token(token, expected_type="refresh")
    if err is not None:
        return fail(ERR_REFRESH_INVALID)

    user = User.query.get(int(payload["sub"]))
    if user is None:
        return fail(ERR_REFRESH_INVALID)

    access = issue_access_token(user)
    from datetime import datetime
    from flask import current_app
    user.jwt_token = access
    user.jwt_expires_at = datetime.utcnow() + current_app.config["JWT_ACCESS_EXPIRES"]
    db.session.commit()
    return ok({
        "access_token": access,
        "expires_in": int(current_app.config["JWT_ACCESS_EXPIRES"].total_seconds()),
    })


@user_bp.get("/profile")
@require_auth
def profile():
    u = g.current_user
    return ok({
        "id": u.id,
        "phone": u.phone,
        "nickname": u.nickname,
        "role": u.role,
        "points": u.points,
        "created_at": u.created_at.isoformat() if u.created_at else None,
        "last_login_at": u.last_login_at.isoformat() if u.last_login_at else None,
    })
