from __future__ import annotations

import json
from dataclasses import dataclass
from urllib.parse import urlsplit

import boto3
import requests


@dataclass(frozen=True)
class SupabaseCredentials:
    url: str
    secret_key: str


def load_visolix_api_key(secret_arn: str, region: str) -> str:
    response = boto3.client("secretsmanager", region_name=region).get_secret_value(SecretId=secret_arn)
    value = json.loads(response["SecretString"])
    api_key = value.get("apiKey")
    if not isinstance(api_key, str) or not api_key or len(api_key) > 500:
        raise RuntimeError("Visolix API secret is malformed")
    return api_key


def load_feishu_webhook_url(secret_arn: str, region: str) -> str:
    response = boto3.client("secretsmanager", region_name=region).get_secret_value(SecretId=secret_arn)
    value = json.loads(response["SecretString"])
    webhook_url = value.get("webhookUrl")
    if not isinstance(webhook_url, str) or len(webhook_url) > 2048:
        raise RuntimeError("Feishu webhook secret is malformed")
    parsed = urlsplit(webhook_url)
    if (
        parsed.scheme != "https"
        or parsed.hostname != "open.feishu.cn"
        or not parsed.path.startswith("/open-apis/bot/v2/hook/")
        or parsed.query
        or parsed.fragment
        or parsed.username
        or parsed.password
    ):
        raise RuntimeError("Feishu webhook secret is malformed")
    return webhook_url


def send_feishu_provider_alert(webhook_url: str, alert_type: str, payload: dict):
    if alert_type != "provider_balance_exhausted":
        raise RuntimeError("Unsupported media alert type")
    provider = payload.get("provider") if isinstance(payload.get("provider"), str) else "media provider"
    response = requests.post(
        webhook_url,
        json={
            "msg_type": "text",
            "content": {
                "text": (
                    "【Pullvio 告警】媒体下载供应商余额不足\n"
                    f"供应商：{provider}\n"
                    "系统已自动关闭所有 Visolix 平台的新任务，客户端会显示友好提示。"
                    "请充值并完成恢复检查后再手动开启。"
                )
            },
        },
        timeout=(5, 10),
    )
    response.raise_for_status()


def load_proxy_url(secret_arn: str, region: str) -> str:
    response = boto3.client("secretsmanager", region_name=region).get_secret_value(SecretId=secret_arn)
    value = json.loads(response["SecretString"])
    proxy_url = value.get("proxyUrl")
    if not isinstance(proxy_url, str) or len(proxy_url) > 2048:
        raise RuntimeError("Media proxy secret is malformed")
    return proxy_url


def load_supabase_credentials(secret_arn: str, region: str) -> SupabaseCredentials:
    response = boto3.client("secretsmanager", region_name=region).get_secret_value(SecretId=secret_arn)
    value = json.loads(response["SecretString"])
    url = value.get("url")
    secret_key = value.get("secretKey")
    if not isinstance(url, str) or not url.startswith("https://") or not isinstance(secret_key, str):
        raise RuntimeError("Supabase worker secret is malformed")
    return SupabaseCredentials(url=url.rstrip("/"), secret_key=secret_key)


class SupabaseRpcClient:
    def __init__(self, credentials: SupabaseCredentials):
        self._url = credentials.url
        self._session = requests.Session()
        self._session.headers.update(
            {
                "apikey": credentials.secret_key,
                "Authorization": f"Bearer {credentials.secret_key}",
                "Content-Type": "application/json",
                "User-Agent": "pullvio-media-worker/1",
            }
        )

    def rpc(self, name: str, payload: dict):
        response = self._session.post(
            f"{self._url}/rest/v1/rpc/{name}",
            json=payload,
            timeout=(5, 20),
        )
        response.raise_for_status()
        return response.json()
