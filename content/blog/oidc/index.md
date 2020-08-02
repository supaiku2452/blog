---
title: OpenID Connectの概要を理解する
date: "2020-07-19"
tags: ["OAuth", "OAuth2.0", "OIDC", "認可"]
---

今回は OpenID Connect 1.0(以降、OIDC)の概要について説明していきたいと思います。この記事では OAuth2.0 の説明は行いませんので、よろしければ前回の記事を一読ください。

## OIDC とは

OIDC は OAuth2.0 にアイデンティティーレイヤーを追加したものです。OIDC では、認証サーバーでユーザーのアイデンティティーの検証と、ユーザーの必要最低限のプロフィール情報の取得を可能にします。ただし、RFC ではアイデンティティー情報を提供する手段は仕様では定められていません。

OIDC を利用する場合は、認可リクエストの **scope** に **openid** を設定して、リクエストを送ります。認可サーバーで認証結果に問題がない場合は、 **ID Token** と呼ばれる **JWT(Json Web Token)** を返却します。この ID token にはアイデンティティー情報が格納されています。

ID Token は Claim と呼ばれるユーザー情報を含んだセキュリティトークンです。ここには、ユーザー情報が格納されており、必須のものや任意のものがあります。ここでは詳細な項目は省略しますが、詳しくはこちらを参照してください。

- [OpenID Connect Core 1.0 - 2. ID Token](https://openid.net/specs/openid-connect-core-1_0.html#IDToken)
- [OpenID Connect Core 1.0 - 5.1. Standard Claims](https://openid.net/specs/openid-connect-core-1_0.html#StandardClaims)

次は認証フローの説明をしていきます。

## 認証フロー

OIDC の認証フローは以下の３つが存在します。このフローは、指定する response_type によって決定されます。

|        フロー        |    response_type    |
| :------------------: | :-----------------: |
|   認証コードフロー   |        code         |
| インプリシットフロー |      id_token       |
| インプリシットフロー |   id_token token    |
|  ハイブリッドフロー  |    code id_token    |
|  ハイブリッドフロー  |     code token      |
|  ハイブリッドフロー  | code id_token token |

OAuth2.0 でも登場した認証コードフローとインプリシットフローに加え、ハイブリッドフローが追加されています。各フローの特徴を理解した上で判断するとよいと思います。

| 特徴                                                   | 認証コードフロー | インプリシットフロー | ハイブリッドフロー |
| :----------------------------------------------------- | :--------------: | :------------------: | :----------------: |
| すべてのトークンが認可エンドポイントから返却される     |        x         |          o           |         o          |
| すべてのトークンがトークンエンドポイントから返却される |        o         |          x           |         x          |
| トークンがユーザーエージェントに渡らない               |        o         |          x           |         x          |
| クライアント認証が可能である                           |        o         |          x           |         o          |
| リフレッシュトークンが利用できる                       |        o         |          x           |         o          |
| 通信が１往復だけである                                 |        x         |          o           |         x          |
| ほとんどの通信がサーバ間である                         |        o         |          x           |       異なる       |

次はそれぞれのフローの説明をしていきます。

### 認証コードフロー

認証コードフローは、すべてのトークンがトークンエンドポイントから返却されるフローです。認証コードフローでは、認可コードをトークンエンドポイントに渡すことで、アクセストークンと ID Token を取得します。

(1) クライアントは認証リクエストを送信します(OAuth2.0 の認可リクエストと同じです)。このときクライアントが送る認証リクエストは以下の通りです。

```none
GET {endpoint url} HTTP/1.1
Host: {host}

response_type=code
scope=openid
client=hogehoge
state=alsdjfalskdf
redirect_uri=https://www.example.com/hoge/fuga
```

| name          | attr        | description                                                                                                                     |
| :------------ | :---------- | :------------------------------------------------------------------------------------------------------------------------------ |
| scope         | REQUIRED    | OIDC の場合は **openid** を必ず含めます。                                                                                       |
| response_type | REQUIRED    | 認証コードフローの場合は **code** で固定です                                                                                    |
| client_id     | REQUIRED    | 認可サーバーが発行したクライアント ID                                                                                           |
| redirect_uri  | REQUIRED    | レスポンスされるリダイレクト URI です。この URI は、OpenID Provider に対して事前に登録済みの URI と完全一致する必要があります。 |
| state         | RECOMMENDED | 主に CSRF、XSRF 対策のために使用されるクエリ。                                                                                  |

OIDC では上記以外にもクエリが増えています。詳細は、[OpenID Connect Core 1.0 - 3.1.2.1. Authentication Request](https://openid.net/specs/openid-connect-core-1_0.html#AuthRequest)を参照ください。

(2) 認証サーバーはユーザーを認証をします。認証リクエストに対するバリデーションと認証については、[OpenID Connect Core 1.0 - 3.1.2.2. Authentication Request Validation](https://openid.net/specs/openid-connect-core-1_0.html#AuthRequestValidation)と[OpenID Connect Core 1.0 - 3.1.2.3. Authorization Server Authenticates End-User](https://openid.net/specs/openid-connect-core-1_0.html#Authenticates)を参照してください。

(3) 認証サーバーがユーザーの同意と認可を得たら、認可コードをクライアントに返却します。このとき認証サーバーが返却するレスポンスは以下の通りです。

```none
HTTP/1.1 302 Found
Location: https://www.exmaple.com/hoge/fuga?

code=hogehogefugafuga
state=xyzxyz
```

(4) クライアントは認可コードを使用して、トークンエンドポイントにリクエストを送信します。このときクライアントが送るトークンエンドポイントへのリクエストは以下の通りです(リクエストの詳細は OAuth2.0 の認可コードフローと同じです)。

```none
GET {endpoint url} HTTP/1.1
Host: {host}
Content-Type: application/x-www-form-urlencoded
Authorization: Basic adfaljdfaljdfalkdjalkjfs

grant_type=authorization_code
code=hogehogefugafuga
redirect_uri=https://www.example.com/hoge/fuga
```

(5) 認可サーバーは、リクエストの検証行う。リクエストの検証の詳細は、[OpenID Connect Core 1.0 - 3.1.3.2. Token Request Validation](https://openid.net/specs/openid-connect-core-1_0.html#TokenRequestValidation)を参照ください。

検証結果に問題がない場合は、アクセストークンと ID Token をレスポンスに設定し、返却します。このとき認可サーバーが返却するレスポンスは以下の通りです。

```none
HTTP/1.1 200 OK
Content-Type: application/json;charset=UTF-8
Cache-Control: no-store
Pragma: no-cache

{
  "access_token": "aklsdjfalksjfasifkjfa",
  "token_type": "Bearer",
  "expires_in":3600,
  "refresh_token":"kasdfadfas8fa0wieafsdfaj",
  "id_token": "eyJhb...vKMzqg"
}
```

トークン、キー、その他センシティブな情報を含む場合は、レスポンスをキャッシュに保存することを禁止するために、ヘッダーに以下を指定する必要があります。

| name          | value    |
| :------------ | :------- |
| Cache-Control | no-store |
| Pragma        | no-cache |

(6) クライアントは返却された ID Token を検証します。

### インプリシットフロー

インプリシットフローは、認証リクエストを送り、認証が終わるとレスポンスとして、アクセストークンと ID Token の両方を取得するフローです(アクセストークンは任意です)。

(1) クライアントが認可サーバーの認可エンドポイントに認可リクエストを送ります。このときクライアントが送る認可リクエストは以下の通りです。

```none
GET {endpoint url} HTTP/1.1
Host: {host}
Content-Type: application/x-www-form-urlencoded

response_type=id_token token
client_id=xxxyyyzzz
redirect_uri=https://www.example.com/hoge/fuga
scope=hoge fuga
state=xyzxyz
nonce=piyo
```

| name          | attr        | description                                                                                                                                       |
| :------------ | :---------- | :------------------------------------------------------------------------------------------------------------------------------------------------ |
| response_type | REQUIRED    | インプリシットフローの場合は **id_token token**または**id_token** となります。 **token** は指定すると ID Token を返却できないため、使用しません。 |
| client_id     | REQUIRED    | 認可サーバーが発行したクライアント ID                                                                                                             |
| redirect_uri  | REQUIRED    | 認可コードと同じなので割愛                                                                                                                        |
| scope         | OPTIONAL    | 認可コードと同じなので割愛                                                                                                                        |
| state         | RECOMMENDED | 認可コードと同じなので割愛                                                                                                                        |
| nonce         | REQUIRED    | リプレイアタック対策に使用します。この値は認証リクエスト時に生成され、ID Token の nonce claim に含まれます。                                      |

(2) 認証サーバーはユーザーを認証します。詳細は認証コードフローと同じなので割愛します。

(3) 認証サーバーがユーザーの同意と認可を得たら、ID Token とアクセストークン(任意)をクライアントに返却します。このとき認証サーバーが返却するレスポンスは以下の通りです。

```none
HTTP/1.1 302 Found
Location: https://www.exmaple.com/hoge/fuga#

access_token=alskdjfal
token_type=bearer
id_token=asldkjfalkdjfsa
expires_in=3600
state=xyzxyz
```

| name         | attr        | description                                                                                                                      |
| :----------- | :---------- | -------------------------------------------------------------------------------------------------------------------------------- |
| access_token | REQUIRED    | reponse_type が **id_token token** の場合に返却されます。                                                                        |
| token_type   | REQUIRED    | トークンのタイプを示します。詳細は[7.1. Access Token Types](https://tools.ietf.org/html/rfc6749#section-7.1)を参照してください。 |
| id_token     | REQUIRED    | ID Token です。イ                                                                                                                |
| expires_in   | RECOMMENDED | 認可コードフローと同じなので割愛します。                                                                                         |
| state        | RECOMMENDED | 認可コードフローと同じなので割愛します。                                                                                         |

インプリシットフローの場合は、ID Token に含める claim が認可コードフローと異なります。

|  name   |   attr   | description                                                  |
| :-----: | :------: | :----------------------------------------------------------- |
|  nonce  | REQUIRED | インプリシットフローの場合は必須となります。                 |
| at_hash | REQUIRED | response_type が **id_token token** の場合、必須となります。 |

(4) クライアントは返却された ID Token を検証します。

### ハイブリッドフロー

ハイブリッドフローは、トークンを取得するエンドポイントが複数存在するフローです。

(1) クライアントは認証リクエストを送信します(OAuth2.0 の認可リクエストと同じです)。このときクライアントが送る認証リクエストは以下の通りです。

```none
GET {endpoint url} HTTP/1.1
Host: {host}

response_type=code
scope=openid
client=hogehoge
state=alsdjfalskdf
redirect_uri=https://www.example.com/hoge/fuga
```

| name          | attr        | description                                                                        |
| :------------ | :---------- | :--------------------------------------------------------------------------------- |
| response_type | REQUIRED    | response_type によりどのエンドポイントからどのトークンが返ってくるか決定されます。 |
| scope         | REQUIRED    | 認可コードフローと同じなので割愛します。                                           |
| client_id     | REQUIRED    | 認可コードフローと同じなので割愛します。                                           |
| redirect_uri  | REQUIRED    | 認可コードフローと同じなので割愛します。                                           |
| state         | RECOMMENDED | 認可コードフローと同じなので割愛します。                                           |

ハイブリッドフローにおける response_type は以下の通りです。

- code id_token
- code token
- code id_token token

(2) 認証サーバーはユーザーを認証します。詳細は認証コードフローと同じなので割愛します。

(3) 認証サーバーがユーザーの同意と認可を得たら、認可コードと、response_type に応じたトークンをクライアントに返却します。このとき認証サーバーが返却するレスポンスは以下の通りです。

```none
HTTP/1.1 302 Found
Location: https://www.exmaple.com/hoge/fuga#

code=aldkjaflsd
access_token=alskdjfal
token_type=bearer
id_token=asldkjfalkdjfsa
expires_in=3600
state=xyzxyz
```

| name         | attr        | description                                                                              |
| :----------- | :---------- | ---------------------------------------------------------------------------------------- |
| access_token | REQUIRED    | reponse_type が **code token** または **code id_token token** の場合に返却されます。     |
| token_type   | REQUIRED    | インプリシットフローと同じなので割愛します。                                             |
| id_token     | REQUIRED    | response_type が **code id_token** または **code id_token token** の場合に返却されます。 |
| expires_in   | RECOMMENDED | インプリシットフローと同じなので割愛します。                                             |
| state        | RECOMMENDED | インプリシットフローと同じなので割愛します。                                             |

(4) クライアントは認可コードを使用して、トークンエンドポイントにリクエストを送信します。このときクライアントが送るトークンエンドポイントへのリクエストは以下の通りです。

```none
GET {endpoint url} HTTP/1.1
Host: {host}
Content-Type: application/x-www-form-urlencoded
Authorization: Basic adfaljdfaljdfalkdjalkjfs

grant_type=authorization_code
code=hogehogefugafuga
redirect_uri=https://www.example.com/hoge/fuga
```

(5) 認可サーバーは、リクエストの検証行う。リクエストの検証の詳細は、[OpenID Connect Core 1.0 - 3.1.3.2. Token Request Validation](https://openid.net/specs/openid-connect-core-1_0.html#TokenRequestValidation)を参照ください。

検証結果に問題がない場合は、アクセストークンと ID Token をレスポンスに設定し、返却します。このとき認可サーバーが返却するレスポンスは以下の通りです。

```none
HTTP/1.1 200 OK
Content-Type: application/json;charset=UTF-8
Cache-Control: no-store
Pragma: no-cache

{
  "access_token": "aklsdjfalksjfasifkjfa",
  "token_type": "Bearer",
  "expires_in":3600,
  "refresh_token":"kasdfadfas8fa0wieafsdfaj",
  "id_token": "eyJhb...vKMzqg"
}
```

(6) クライアントは返却された ID Token を検証します。
