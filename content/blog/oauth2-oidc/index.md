---
title: OAuth2.0に関するまとめ
date: "2020-07-19"
tags: ["OAuth", "OAuth2.0", "認可"]
---

<details>
<summary>TOC</summary>

- [OAuth2.0 とは](#oauth20-とは)
- [OAuth2.0 のフロー概略](#oauth20-のフロー概略)
- [OAuth2.0 の認可フロー種別](#oauth20-の認可フロー種別)
  - [認可コードフロー](#認可コードフロー)
  - [インプリシットフロー](#インプリシットフロー)
  - [リソースオーナーパスワードクレデンシャルフロー](#リソースオーナーパスワードクレデンシャルフロー)
  - [クライアントクレデンシャルフロー](#クライアントクレデンシャルフロー)
  - [リフレッシュトークン](#リフレッシュトークン)
- [まとめ](#まとめ)
  </details>

最近業務で利用していた AWS Cognito+Facebook での認証周りの挙動について調べることがあったのですが、調べるにあたりそもそも OAuth2.0 や OIDC を知らないと理解できないのでは？という気持ちになったので、これらのサービスやそれにまつわる認証部分について利用者側として最低限の知識を自分が調べた範囲でまとめます。今回は OAuth2.0 について、次回は OIDC についてまとめていこうと思います。

## OAuth2.0 とは

OAuth2.0 は、[RFC 6749](https://tools.ietf.org/html/rfc6749)で定義されており、以下のように要約されます。

> The OAuth 2.0 authorization framework enables a third-party
> application to obtain limited access to an HTTP service, either on
> behalf of a resource owner by orchestrating an approval interaction
> between the resource owner and the HTTP service, or by allowing the
> third-party application to obtain access on its own behalf.

[RFC 6749 Abstract より引用](https://tools.ietf.org/html/rfc6749)

日本語訳を以下の引用からみると、

> OAuth 2.0 は, サードパーティーアプリケーションによる HTTP サービスへの限定的なアクセスを可能にする認可フレームワークである. サードパーティーアプリケーションによるアクセス権の取得には, リソースオーナーと HTTP サービスの間で同意のためのインタラクションを伴う場合もあるが, サードパーティーアプリケーション自身が自らの権限においてアクセスを許可する場合もある. 本仕様書は RFC 5849 に記載されている OAuth 1.0 プロトコルを廃止し, その代替となるものである.

[OpenID Japan ページ内 Abstract より引用](https://openid-foundation-japan.github.io/rfc6749.ja.html)

となります。

簡単に言うとサードパーティーへの限定的なアクセスを可能にする認可フレームワークです。

従来のクラサバ型の認証モデルでは、クライアントからサードパーティアプリケーションにアクセスする際は、クライアントにサードパーティアプリケーションのクレデンシャルを入力してもらい、それを利用してリソースにアクセスしていました。

しかし、この認証モデルではセキュリティリスクの低下、サーバーがパスワード形式の認証方法をサポートしなければならないなどの問題があります。

例えば、自分が何かしらのチャットサービスを使っているとします。そのチャットサービスで、Google アカウントの連絡先に登録されている人をそのチャットサービスに登録する機能があります。
今利用しているチャットサービスは Google アカウントの情報を知らないので、どうにかして Google アカウントにアクセスする必要があります。このとき、チャットサービスがログイン ID とパスワードを入力してくれれば Google アカウントからアカウント情報をとってくる。となると、クライアントに Google のユーザー ID とパスワードが保存された状態となります。この状態でチャットサービスが情報漏洩をしてしまった場合や、チャットサービス自体が悪意のあるサービスだった場合、情報が第 3 者に漏洩してしまいます。

OAuth2.0 はこのような状況の時に、第 3 者へユーザー ID・パスワードを渡さずに、制限されたリソースにアクセスできる仕組みを提供します。ただし、OAuth2.0 では認証に関する部分は仕様として定められていないので、**認証フレームワークではないこと**に注意してください。

認証フレームワークではないと記載しているのは、[RFC 6749 3.1. Authorization Endpoint](https://tools.ietf.org/html/rfc6749#section-3.1)に、以下の一文があるからです。

> The way in
> which the authorization server authenticates the resource owner
> (e.g., username and password login, session cookies) is beyond the
> scope of this specification.

**認可サーバーでのリソースオーナーの認証方法(ユーザー ID/パスワード、セッション、クッキー)は、仕様書のスコープ外です。** と記載されているからです。

## OAuth2.0 のフロー概略

それでは、大まかな OAuth2.0 の概要を理解した上で、チャットサービスを例に Google アカウントのアクセス権を得るまでの流れと登場人物についての説明していきたいと思います。

OAuth2.0 に出てくる登場人物は以下の通りです。

- リソースオーナー: 保護されたリソース(Google アカウント)へのアクセスを許可するエンティティー。ここでいう、自分のこと
- リソースサーバー: アクセストークンを用いて保護されたリソースを提供することができる(レスポンスする)サーバー。ここでいう、Google アカウント(エンドポイント)のこと
- クライアント: リソースオーナーの承諾を受けて、リソースサーバーにアクセスすることができるアプリケーション。ここでいう、チャットサービスのこと
- 認可サーバー: リソースオーナーの認証と認可が成功したときに、アクセストークンをクライアントに発行するサーバー。ここでは登場していないが Google アカウント認証サーバーだと仮定します

次に基本フローについては説明していきます。下図を参照してください。

![OAuth2.0 基本フロー](rfc6749_oauth_flow.png)

下図の中で注目したいところは、**ステップ 2.**と**ステップ 4. ~ ステップ 6.**です。それぞれのステップでの役割は以下の通りです。

- **ステップ 2.**: クライアントは認可エンドポイントへリクエストを投げます。すると、クライアントではなくユーザーエージェントを通じてユーザー(リソースオーナー)が認証情報の入力とスコープの許諾を行います。そのため、クライアントにクレデンシャルがわたらないようになっています。
- **ステップ 4.**: 認可サーバーでユーザーの認証と認可を行い、認可コードを発行します
- **ステップ 5.**: クライアントから認可サーバーのトークンエンドポイントへリクエストを投げます。このときステップ 4.で受け取った認可コードを一緒に渡します
- **ステップ 6.**: 認可サーバーは認可コードの検証を行い問題がなければアクセストークンを返却します

では次に OAuth2.0 に記載されている 4 つのフローを見ていきたいと思います。

## OAuth2.0 の認可フロー種別

OAuth2.0 では 4 つのフローが記載されています。また、 **リフレッシュトークン** は認証周りの機能を実装するときによく使われると思うので合わせて触れておきたいと思います。

- 認可コードフロー: [RFC 6749 - 4.1. Authorization Code Grant](https://tools.ietf.org/html/rfc6749#section-4.1)
- インプリシットフロー: [RFC 6749 - 4.2. Implicit Grant](https://tools.ietf.org/html/rfc6749#section-4.2)
- リソースオーナーパスワードクレデンシャルフロー: [RFC 6749 - 4.3. Resource Owner Password Credentials Grant](https://tools.ietf.org/html/rfc6749#section-4.3)
- クライアントクレデンシャルフロー: [RFC 6749 - 4.4. Client Credentials Grant](https://tools.ietf.org/html/rfc6749#section-4.4)
- リフレッシュトークン: [RFC 6749 - 6. Refreshing an Access Token](https://tools.ietf.org/html/rfc6749#section-6)

### 認可コードフロー

認可コードフローは、認可コードを発行してもらい、その認可コードからアクセストークンとリフレッシュトークンの両方を取得するためのフローです。

(1) クライアントが認可サーバーの認可エンドポイントに認可リクエストを送ります。このときクライアントが送る認可リクエストは以下の通りです。

```none
GET {endpoint url} HTTP/1.1
Host: {host}
Content-Type: application/x-www-form-urlencoded

response_type=code
client_id=xxxyyyzzz
redirect_uri=https://www.example.com/hoge/fuga
scope=hoge fuga
state=xyzxyz
```

| name          | value            | attr        | description                                                                                                                                                                                                                                                    |
| :------------ | :--------------- | :---------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| response_type | "code"           | REQUIRED    | 認可コードフローの場合は **code**で固定                                                                                                                                                                                                                        |
| client_id     | クライアント ID  | REQUIRED    | 認可サーバーが発行したクライアント ID                                                                                                                                                                                                                          |
| redirect_uri  | リダイレクト URI | OPTIONAL    | リソースオーナーとのやりとりが完了した後に、認可サーバーはユーザーエージェントをクライアントへ誘導するために使用する URI。リダイレクト URI は、認可サーバーで事前に登録するか、クエリで指定する。                                                              |
| scope         | スコープ         | OPTIONAL    | 保護されたリソースにのアクセスできる範囲を指定します。例えば、YouTube アカウントの表示でスコープを絞る場合は、 `scope=https://www.googleapis.com/auth/youtube.readonly` となります。scope はプロバイダーごとで異なるため、ドキュメントを読んで指定しましょう。 |
| state         | ステート         | RECOMMENDED | 主に CSRF 対策のために使用されるクエリ。値はクライアントから認可サーバーへリクエストを送る際に、クライアントが発行するものであり、認可サーバーーはレダイレクトによりユーザーエージェントからクライアントに戻る時にこの値を含めます。                           |

(2) 認可サーバーの認可エンドポイントは、受け付けたリクエストを元にリソースオーナーを認証し、認可を得ます。認証は、ユーザーエージェント(ブラウザ)を通じて行われます(画面でユーザー、パスワードなどの入力するイメージ)。

(3) (2)で認証・認可が行われると認証サーバーからクライアントにレスポンスを返します。レスポンスは以下の通りです。

```none
HTTP/1.1 302 Found
Location: https://www.exmaple.com/hoge/fuga?

code=hogehogefugafuga
state=xyzxyz
```

| name  | value      | attr                                   | description                                                                                                                                                                                                                                                                                                                                    |
| :---- | :--------- | :------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| code  | 認可コード | REQUIRED                               | 認可サーバーにより発行された認可コードです。認可コードは漏洩のリスクがあるため有効期限を設定する必要があります。RFC で推奨されている時間は 10 分です。また、認可コードが 2 回以上使用されたら、認可サーバーはリクエストを拒否する必要があります(トークン発行後はリフレッシュトークンで再発行ができるから、認可コードは 1 回しか使わないはず)。 |
| state | ステート   | REQUIRED(リクエストに含まれていた場合) | 認可エンドポイントのリクエストに含まれていた場合は必須です。返却する値は、リクエスト時の値となります。                                                                                                                                                                                                                                         |

(4) (3)で発行された認可コードを認可サーバーのトークンエンドポイントにリクエストします。このときクライアントが送るトークンリクエストは以下の通りです。

```none
POST {endpoint url} HTTP/1.1
Host: {host}
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
code=hogehogefugafuga
redirect_uri=https://www.example.com/hoge/fuga
client_id=xxxyyyzzz
```

| name         | value                | attr     | description                                                                                                                                                                                       |
| :----------- | :------------------- | :------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| grant_type   | "authorization_code" | REQUIRED | 認可コードフローの場合は **authorization_code**で固定                                                                                                                                             |
| code         | 認可コード           | REQUIRED | 認可サーバーが発行した認可コード ID                                                                                                                                                               |
| redirect_uri | リダイレクト URI     | OPTIONAL | リソースオーナーとのやりとりが完了した後に、認可サーバーはユーザーエージェントをクライアントへ誘導するために使用する URI。リダイレクト URI は、認可サーバーで事前に登録するか、クエリで指定する。 |
| client_id    | クライアント ID      | REQUIRED | 認可サーバーが発行したクライアント。ここではクライアントが認証されいない場合は必須となる。                                                                                                        |

(5) 認可サーバーは、トークンリクエストを受け付けたら、アクセストークンやリフレッシュトークンを発行しレスポンスとして返却します。このときのトークンエンドポイントのレスポンスは以下の通りです。

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
  "scope":"hoge fuga"
}
```

トークンエンドポイントのレスポンス詳細は以下の通りです。

| name          | value                | attr        | description                                                                                                                      |
| :------------ | :------------------- | :---------- | :------------------------------------------------------------------------------------------------------------------------------- |
| access_token  | アクセストークン     | REQUIRED    | 認可サーバーにより発行されたアクセストークンです。                                                                               |
| token_type    | トークンタイプ       | REQUIRED    | トークンのタイプを示します。詳細は[7.1. Access Token Types](https://tools.ietf.org/html/rfc6749#section-7.1)を参照してください。 |
| expires_in    | 有効期限             | RECOMMENDED | アクセストークンの有効期間(秒)です。推奨なのでどのような値が返却されるかはプロバイダーのドキュメントを読むのが良さそうです。     |
| refresh_token | リフレッシュトークン | OPTIONAL    | アクセストークンの更新の際に使用するトークンです。一般的に有効期限が長いアクセストークンをリクエストする時に使用します。         |
| scope         | スコープ             | OPTIONAL    | クライアントから同一のスコープが指定された場合は任意です。 それ以外は必須となります。                                            |

### インプリシットフロー

インプリシットフローは、認可リクエストをすると、その応答としてアクセストークンを取得するフローです。こちらのフローでは、リフレッシュトークンの発行はサポートされていません。またセキュリティ的に安全ではないフローですので、必要がない場合以外は使用を避けた方が良いでしょう。
[※OAuth best practice 2.1.2](https://tools.ietf.org/html/draft-ietf-oauth-security-topics-09#section-2.1.2)

(1) クライアントが認可サーバーの認可エンドポイントに認可リクエストを送ります。このときクライアントが送る認可リクエストは以下の通りです。

```none
GET {endpoint url} HTTP/1.1
Host: {host}
Content-Type: application/x-www-form-urlencoded

response_type=token
client_id=xxxyyyzzz
redirect_uri=https://www.example.com/hoge/fuga
scope=hoge fuga
state=xyzxyz
```

| name          | value            | attr        | description                                      |
| :------------ | :--------------- | :---------- | :----------------------------------------------- |
| response_type | "token"          | REQUIRED    | インプリシットフローの場合は **token**で固定です |
| client_id     | クライアント ID  | REQUIRED    | 認可コードフローと同じなので割愛します           |
| redirect_uri  | リダイレクト URI | OPTIONAL    | 認可コードフローと同じなので割愛します           |
| scope         | スコープ         | OPTIONAL    | 認可コードフローと同じなので割愛します           |
| state         | ステート         | RECOMMENDED | 認可コードフローと同じなので割愛します           |

(2) 認可サーバーの認可エンドポイントは、受け付けたリクエストを元にリソースオーナーを認証し、認可を得ます。認証は、ユーザーエージェント(ブラウザ)を通じて行われます(画面でユーザー、パスワードなどの入力するイメージ)。

(3) (2)で認証・認可が行われると認証サーバーからリダイレクト URI を利用してクライアントに戻します。このとき URI には発行されたアクセストークンが含まれます。レスポンスは以下の通りです。

```none
HTTP/1.1 302 Found
Location: https://www.exmaple.com/hoge/fuga#access_token=asdlkfajlskdfasdfalk&token_type=Bearer&...

access_token=asdlkfajlskdfasdfalk
token_type=Bearer
expires_in=3600
scope="hoge fuga"
state=xyzxyz
```

| name         | value            | attr        | description                                                                                                                      |
| :----------- | :--------------- | :---------- | :------------------------------------------------------------------------------------------------------------------------------- |
| access_token | アクセストークン | REQUIRED    | 認可サーバーにより発行されたアクセストークンです。                                                                               |
| token_type   | トークンタイプ   | REQUIRED    | トークンのタイプを示します。詳細は[7.1. Access Token Types](https://tools.ietf.org/html/rfc6749#section-7.1)を参照してください。 |
| expires_in   | 有効期限         | RECOMMENDED | アクセストークンの有効期間(秒)です。推奨なのでどのような値が返却されるかはプロバイダーのドキュメントを読むのが良さそうです。     |
| scope        | スコープ         | OPTIONAL    | クライアントから同一のスコープが指定された場合は任意です。 それ以外は必須となります。                                            |
| state        | ステート         | RECOMMENDED | リクエストに含まれている場合は指定が必要です                                                                                     |

(4) クライアントはユーザーエージェントを redirect_uri を元にリダイレクト(フラグメントは除く)します。

(5) リダイレクト先からの返却は Web ページが返却されます(このとき返却される Web ページには埋め込みのスクリプトがあります)。Web ページはユーザーエージェントが保つ完全な URI にアクセスし、アクセストークンを取り出します。

(6) ユーザーエージェントはクライアントにアクセストークンを渡します

### リソースオーナーパスワードクレデンシャルフロー

リソースオーナーパスワードクレデンシャルフローは、リソースオーナーのクレデンシャル(ユーザー ID/パスワード)を利用してアクセストークンを取得するフローです。こちらのフローは、クライアントがクレデンシャルを保持するため、リソースオーナーがクライアントを信用している、もしくはこのフローでしたアクセストークンを取得できない場合にのみ利用を止めるべきです。

(1) リソースオーナーはクライアントにユーザー ID とパスワードを提供します。RFC では、クライアントリソースオーナーからクレデンシャルを取得する方法は定めていません。しかし、アクセストークン取得後はクレデンシャルを破棄しなければなりません。

(2) クライアントは認可サーバーに、リソースオーナーから取得したクレデンシャルをリクエストに含めて、アクセストークンをリクエストします。このときクライアントが送るリクエストは以下の通りです。

```none
POST {endpoint url} HTTP/1.1
Host: {host}
Content-Type: application/x-www-form-urlencoded

grant_type=password
username=user01
password=password01
scope=hoge fuga
```

| name       | value       | attr     | description                                     |
| :--------- | :---------- | :------- | :---------------------------------------------- |
| grant_type | "password"  | REQUIRED | 認可コードフローの場合は **password**で固定です |
| username   | ユーザー ID | REQUIRED | リソースオーナーのユーザー ID を指定 します     |
| password   | パスワード  | REQUIRED | リソースオーナーのパスワードを指定します        |
| scope      | スコープ    | OPTIONAL | その他と同じなので割愛                          |

(3) 認可サーバーは、リソースオーナーのクレデンシャルを検証し、問題がなければアクセストークンを返却します。リフレッシュトークンの発行は任意となっています。アクセストークンリクエストのレスポンスは以下の通りです。

```none
HTTP/1.1 200 OK
Content-Type: application/json;charset=UTF-8
Cache-Control: no-store
Pragma: no-cache

{
  "access_token": "aklsdjfalksjfasifkjfa"
  "token_type": "Bearer",
  "expires_in":3600,
  "refresh_token":"kasdfadfas8fa0wieafsdfaj",
  "scope":"hoge fuga"
}
```

### クライアントクレデンシャルフロー

クライアントクレデンシャルフローは、クライアントと認可サーバーとの間に信頼関係があり、クライアントクレデンシャルのみでアクセストークンを取得するフローです。このフローでは、リソースオーナーの認証は行わずに、クライアントの認証のみが行われます。

(1) クライアントはアクセストークンリクエストにクライアントクレデンシャルを含めてリクエストする。このとき送信されるリクエストは以下の通りです。

```none
POST {endpoint url} HTTP/1.1
Host: {host}
Authorization: Basic alksdjfalskdjfalsjdl
Content-Type: application/x-www-form-urlencoded

grant_type=client_credentials <- required
scope=hoge fuga <- optional
```

| name       | value                | attr     | description                                               |
| :--------- | :------------------- | :------- | :-------------------------------------------------------- |
| grant_type | "authorization_code" | REQUIRED | 認可コードフローの場合は **authorization_code**で固定です |
| scope      | スコープ             | OPTIONAL | その他と同じなので割愛                                    |

(2) 認可サーバーは、クライアントクレデンシャルを元にクライアントを認証し、認証に問題がなければアクセストークンを返却します。このときリフレッシュトークンは含めべきではないとされています。

```none
HTTP/1.1 200 OK
Content-Type: application/json;charset=UTF-8
Cache-Control: no-store
Pragma: no-cache

{
  "access_token": "aklsdjfalksjfasifkjfa",
  "token_type": "Bearer",
  "expires_in":3600,
  "scope":"hoge fuga"
}
```

### リフレッシュトークン

リフレッシュトークンは、クライアントが保持しているアクセストークンを更新する時に使用します。リフレッシュトークンは一般的には、有効期限の長い追加のアクセストークンを取得するために使用します。クライアントタイプがコンフィデンシャルの場合は、認可サーバーでクライアントの認証を行う必要があります。

トークンエンドポイントへのリクエストは以下の通りです。

```none
POST {endpoint url} HTTP/1.1
Host: {host}
Authorization: Basic asdfjasldfjas
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token <- required
refresh_token=falsdjflajdfal's <- required
scope=hoge fuga <- optional
```

| name          | value                | attr     | description                                          |
| :------------ | :------------------- | :------- | :--------------------------------------------------- |
| grant_type    | "refresh_token"      | REQUIRED | 認可コードフローの場合は **refresh_token**で固定です |
| refresh_token | リフレッシュトークン | REQUIRED | 認可サーバーにより発行されたリフレッシュトークン     |
| scope         | スコープ             | OPTIONAL | その他と同じなので割愛                               |

## まとめ

OAuth2.0 は、サードパーティアプリケーションのクレデンシャルをクライアントに渡さずに、制限されたリソースへのアクセスが可能になる認可フローであるということがわかったと思います(一部フローは違いますが)。また、OAuth2.0 は認証フレームワークではないという点も重要となっていますので、間違いのないように気をつけましょう。

次回は OAuth2.0 を拡張した Open ID Connect についてまとめようと思います。

ここまで読んでくださり、ありがとうございました。本記事に関する指摘、意見等々は[Issues](https://github.com/supaiku2452/blog/issues)に記載いただければと思います。
