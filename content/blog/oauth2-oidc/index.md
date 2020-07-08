---
title: OAuth2.0とOIDCに関するまとめ
date: "2020-07-05T01:00:00+0900"
tags: ["OAuth2.0", "OIDC", "JWT"]
---

最近業務で利用していた AWS Cognito+Facebook での認証周りの挙動について調べることがあったのですが、調べるにあたりそもそも OAuth2.0 や OIDC を知らないと理解できないのでは？という気持ちになったので、これらのサービスやそれにまつわる認証部分について利用者側として最低限の知識を自分が調べた範囲でまとめます。

## そもそも OAuth2.0 をなぜ使うのか

クライアントとサーバーのやりとりにおいて、サードパーティーへのアクセスが必要になったときに、サードパーティーの情報をサーバーへ渡さずに限られたリソースにアクセスできるようにするためです。これだとイメージし辛いと思うので例で示します。

例えば、自分が何かしらのチャットサービスを使っているとします。そのチャットサービスで、Google アカウントの連絡先に登録されている人をそのチャットサービスに呼び、チャットをしたくなりました。
今利用しているチャットサービスは Google アカウントの情報を知らないので、どうにかして Google アカウントにアクセスする必要があります。このとき、チャットサービスがログイン ID とパスワードを入力してくれれば Google アカウントからアカウント情報をとってくる。となったときあなたはどう思いますか？
このチャットサービスには本来知らないはずのあなたの Google アカウントが記録されており、やろうと思えばなりすましができます。

ではどのようにすれば、安全に Google アカウントの情報をチャットサービスに連携できるでしょうか。

できれば、チャットサービスでは Google アカウントのユーザー ID とパスワードを入力せずに、なんとかして連絡先を連携したいですよね。

ここで OAuth2.0 の出番です。

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

簡単に言うとサードパーティーへの限定的なアクセスを可能にする認可フレームワークです。これなら、Google アカウントの連絡先へのアクセスもなんとなくできそう。というイメージが沸いたのではないでしょうか。

次では OAuth2.0 で、実際に Google アカウントのアクセス権が取得できるまでの流れを追ってみたいと思います。

## OAuth2.0 の流れ

ここでは実際にチャットサービスが Google アカウントへのアクセス権を得るまでの流れを説明していきます。

その前に OAuth2.0 に出てくる登場人物だけ説明しておきます

- リソースオーナー: 保護されたリソース(Google アカウント)へのアクセスを許可するエンティティー。ここでいう、自分のこと
- リソースサーバー: アクセストークンを用いて保護されたリソースを提供することができる(レスポンスする)サーバー。ここでいう、Google アカウント(エンドポイント)のこと
- クライアント: リソースオーナーの承諾を受けて、リソースサーバーにアクセスすることができるアプリケーション。ここでいう、チャットサービスのこと
- 認可サーバー: リソースオーナーの認証と認可が成功したときに、アクセストークンをクライアントに発行するサーバー。ここでは登場していないが Google アカウント認証サーバーだと仮定します

では流れについて説明していきます(今回は認可コードによる認証フローです)。まずは下図を参照ください。こちらの流れに沿って、必要な場所を補足していきます<br />
<small>※純粋な流れを説明するため、リクエストに含まれるパラメータやリダイレクト処理などの詳細は省きます。詳細を知りたい方は、[RFC 6749 `4.1. Authorization Code Grant`](https://tools.ietf.org/html/rfc6749#section-4.1)を参照ください。</small>

![OAuth2.0 基本フロー](rfc6749_oauth_flow.png)

OAuth の認証フローは、 クライアントが認可サーバーの認可エンドポイントへ認可リクエストをするところから始まります。[下図 1.]。

認可サーバーは、認可リクエストを受け取り、ユーザーに対して認証(ユーザー ID、パスワードなど)と認可(連絡先の閲覧権限)を依頼します。このとき、認可サーバーはリソースオーナー(ユーザー)の ID を確認する必要があります(必須)。認証で使用する属性(ユーザー ID、パスワードなど)はここでは定められてはいません。
[下図 2.]

ユーザーは認可する内容を確認し問題なければ認証を行います(ユーザー ID、パスワードなどの入力)。
[下図 3.]

認可サーバーは、ユーザー認証が完了したら認可コードを発行します。

また、ここで発行される認可コードは漏洩のリスクがあるため有効期限が短めに設定されています(推奨 10 分)。

[下図 4.]

クライアントは取得した認可コードを認可サーバーのトークンエンドポイントへ送ります。
[下図 5.]

認可サーバーは認可コードを受け取り、検証します。正当性が確認できたら、アクセストークンを発行し返却します。<br />
<small>※認可フロー種別によっては、認可サーバーでの処理が異なるがここでは割愛します。詳細を知りたい場合は[4.1.3. Access Token Request](https://tools.ietf.org/html/rfc6749#section-4.1.3)を参照ください。</small>

[下図 6.]

クライアントはリソースサーバーに対して、連絡先をリクエストします。このとき、取得したアクセストークンをリクエストに設定します。

[下図 7.]

リソースサーバーは、アクセストークンの検証を行い、正当性が確認できたら、連絡先を返却します。

[下図 8.]

## OAuth2.0 の認可フロー

ざっくりと認可フローを理解したところで RFC 6749 で定義されている認可フロー４種+α をみていきたいと思います。

以下の `1.~4.` は認可フローです。 `5. リフレッシュトークンフロー` は認証周りの機能を実装するときによく使われると思うので触れておきたいと思います

1. [認可コードフロー: 4.1. Authorization Code Grant](https://tools.ietf.org/html/rfc6749#section-4.1)
2. [インプリシットフロー: 4.2. Implicit Grant](https://tools.ietf.org/html/rfc6749#section-4.2)
3. [リソースオーナーパスワードクレデンシャルフロー: 4.3. Resource Owner Password Credentials Grant](https://tools.ietf.org/html/rfc6749#section-4.3)
4. [クライアントクレデンシャルフロー: 4.4. Client Credentials Grant](https://tools.ietf.org/html/rfc6749#section-4.4)
5. [リフレッシュトークンフロー: 6. Refreshing an Access Token](https://tools.ietf.org/html/rfc6749#section-6)

### 1. [認可コードフロー: 4.1. Authorization Code Grant](https://tools.ietf.org/html/rfc6749#section-4.1)

認可コードフローは、認可コードを発行してもらい、その認可コードからアクセストークンとリフレッシュトークンの両方を取得するためのフローです。

(1) クライアントが認可サーバーの認可エンドポイントに認可リクエストを送ります。このときクライアントが送る認可リクエストは以下の通りです。

```none
GET {endpoint url} HTTP/1.1
Host: {host}
Content-Type: application/x-www-form-urlencoded

response_type=code <- required
client_id=xxxyyyzzz　<- required
redirect_uri=https://www.example.com/hoge/fuga <- optional
scope=hoge fuga <- optional
state=xyzxyz<- recommended
```

cleint_id はクライアント側で発行する任意の識別子。OAuth2.0 でクライアント ID に対する仕様は定めていません。

redirect_uri は、リソースオーナーとのやりとりが完了したら、認可サーバーはユーザーをクライアントへ誘導します。リダイレクト先は、URL に指定されたものか事前登録されたものが使用されます。

scope は、アクセスできるスコープを指定するときに使用します。例えば、YouTube で YouTube アカウントの表示でスコープを絞る場合は、 `scope=https://www.googleapis.com/auth/youtube.readonly` となります。scope はプロバイダーごとで異なるため、ドキュメントを読んで指定しましょう。

state はリクエストとコールバック間が状態を維持するために使用します。基本的には CSRF 対策の用途となります。

(2) 認可サーバーの認可エンドポイントは、受け付けたリクエストを元にリソースオーナーを認証し、認可を得る。認証は、ユーザーエージェント(ブラウザ)を通じて行われます(画面でユーザー、パスワードなどの入力するイメージ)。

(3) (2)で認証・認可が行われると認証サーバーからクライアントにレスポンスを返します。レスポンスは以下の通りです。

```none
HTTP/1.1 302 Found
Location: https://www.exmaple.com/hoge/fuga?

code=hogehogefugafuga <- required
state=xyzxyz <- required if state set
```

code は発行された認可コードです。認可コードは漏洩のリスクがあるため有効期限を設定する必要があります。RFC で推奨されている時間は 10 分です。また、認可コードが 2 回以上使用されたら、認可サーバーはリクエストを拒否する必要があります(トークン発行後はリフレッシュトークンで再発行ができるから、認可コードは 1 回しか使わないはず)。

state はリクエストに含まれていた場合はレスポンスに設定する必要があります。このとき、設定する値はリクエストで設定された値です。

(4) (3)で発行された認可コードを認可サーバーのトークンエンドポイントにリクエストします。このときクライアントが送るトークンリクエストは以下の通りです。

```none
POST {endpoint url} HTTP/1.1
Host: {host}
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code <- required
code=hogehogefugafuga<- required
redirect_uri=https://www.example.com/hoge/fuga <- require if redirect_url set.
client_id=xxxyyyzzz　<- required if the client is not authenticated
```

grant_type は、 `authorization_code` で固定です。

code は、認可サーバから受け取った認可コードを設定します。

redirect_uri と state はいずれ以前の認可リクエストに含まれていたら設定します。

client_id は認証サーバーでクライアント認証が終わっていない場合は必須です。

(5) 認可サーバーは、トークンリクエストを受け付けたら、アクセストークンやリフレッシュトークンを発行しレスポンスとして返却する。このときのトークンレスポンスは以下の通りです。

```none
HTTP/1.1 200 OK
Content-Type: application/json;charset=UTF-8
Cache-Control: no-store
Pragma: no-cache

{
  "access_token": "aklsdjfalksjfasifkjfa", <- required
  "token_type": "Bearer",  <- required
  "expires_in":3600, <- recommended
  "refresh_token":"kasdfadfas8fa0wieafsdfaj", <- optional
  "scope":"hoge fuga"
}
```

access_token は認可サーバーが発行したアクセストークンです。

token_type はトークンのタイプを示します。詳細は[7.1. Access Token Types](https://tools.ietf.org/html/rfc6749#section-7.1)を参照してください

expires_in は、アクセストークンの有効期間(秒)です。推奨なのでどのような値が返却されるかはプロバイダーのドキュメントを読むのが良さそうです。

refresh_token は一般的に有効期限が長いアクセストークンをリクエストするために使用されます。

scope は、認可リクエスト時と同じ scope であれば任意で、その例がは必須となります。
