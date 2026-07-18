from __future__ import annotations

import json
from dataclasses import dataclass

import boto3
import requests


@dataclass(frozen=True)
class SupabaseCredentials:
    url: str
    secret_key: str


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
