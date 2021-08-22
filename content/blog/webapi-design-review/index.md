---
title: WebAPIの開発で気をつけること
date: "2021-08-23T00:00:00+0900"
tags: ["WebAPI","OpenAPI", "RESTful API", "API設計"]
---

WebAPIの開発において、普段気をつけていることや新たに学んだことを踏まえ、今後どういうところを気をつけながら開発していくかまとめる。新たな学びがあった場合は適宜追加する。

筆者が主に参考にした書籍やサイトはこちら。補足情報として参考にしたものはAppendixに記載する。

- [Web API: The Good Parts](https://www.oreilly.co.jp/books/9784873116860/)
- [Web APIの設計](https://www.shoeisha.co.jp/book/detail/9784798167015)
- [Zalando RESTful API と イベントスキーマのガイドライン](https://restful-api-guidelines-ja.netlify.app)
- [リソースモデリングパターン](https://rest-pattern.hatenablog.com/)

## URIと命名

URI設計時は以下のことに注意して設計する。

- URIを見た時に、実行した結果が推測出来る
- URIの命名が統一されている(sname_case / kebab-case)

### URIを見た時に、実行した結果が推測出来る

例えば、検索を行うAPIを利用したいと思った時に、以下2つのURIがあったらどちらが検索APIとして理解しやすか。この場合は`1. https://api.janx2.info/search`が理解しやすい。`2. https://api.janx2.info/s`では、`src`が何を行うか推測出来ない。searchの省略なのか、sourceの省略または別の意味か。

1. https://api.janx2.info/search
2. https://api.janx2.info/src

URLで使用する単語は無駄に略さず、かつ一般的に使用されるものが良い。例えば、検索を示すのであれば、`search`、`refer to`、`look up`、`find`が考えられるが、この場合は`search`が適している。ただし、何が単語として一般的であるか判断に迷うことがあれば複数サービスのAPIを確認すると良い。

### URIの命名が統一されている(sname_case / kebab-case / camelCase)

URIの命名は統一されている方が望ましい。以下はその一例である。ざっと見ただけだが、`snake_case`が多く見える。どの規則を使用するか困った場合は、ホスト名と同じルールに従いkebab-caseにするとよい。もしくは、単語の区切りが必要ないようにスラッシュ区切りで表現してしまうのも良い。

| API名                                                                                       | URL        | 例                                                                                         |
| :------------------------------------------------------------------------------------------ | :--------- | :----------------------------------------------------------------------------------------- |
| [YouTube API](https://developers.google.com/youtube/v3/docs/)                               | camelCase  | GET https://www.googleapis.com/youtube/v3/guideCategories                                  |
| [Twitter API](https://developer.twitter.com/en/docs/twitter-api/api-reference-index)        | snake_case | GET https://api.twitter.com/2/tweets/:id/liking_users                                      |
| [Instagram API](https://developers.facebook.com/docs/instagram-basic-display-api/reference) | snake_case | GET https://graph.instagram.com/access_tokens                                              |
| [OpenWeather API](https://openweathermap.org/api)                                           | snake_case | GET http://api.openweathermap.org/data/2.5/solar_radiation                                 |
| [Dropbox API](https://dropbox.github.io/dropbox-api-v2-explorer/)                           | snake_case | POST https://api.dropboxapi.com/2/contacts/delete_manual_contacts                          |
| [Zalando API](https://developers.merchants.zalando.com/docs/index.html)                     | kebab-case | GET https://api.merchants.zalando.com/merchants/{merchant_id}/attribute-types/{type_label} |

#### 名詞は複数形を使用する

上記例を見るとURIが名詞の複数形になっていることが分かると思うが、リソースは集合を示すものであるため、単数形よりも複数形の方が適している。

## API設計

API設計時は以下の点に注意し設計を行う。

- HTTPメソッドを正しく使う
- バックエンドに影響されたAPIを作らない
- レスポンスのフィールドを選択できる
- APIのバージョン管理と強制バージョンアップ

### HTTPメソッドを正しく使う

APIは、URIとメソッドがあって始めて成立する。メソッドが間違っているとリソースに対してどのような処理が行われるか分からなくなるため、メソッドは正しく利用する。合わせて[ステータスコード](https://datatracker.ietf.org/doc/html/rfc7231#page-47)も正しいものを返却する。

各メソッドの役割と安全性、べき等性については以下の通りである。

| メソッド名 | 役割                         | 安全性 | べき等性 |
| :--------- | :--------------------------- | :----- | :------- |
| GET        | リソースを取得する           | あり   | あり     |
| POST       | 新しいリソースを追加する     | なし   | なし     |
| PUT        | 指定したリソースで置き換える | なし   | あり     |
| PATCH      | リソースの一部を置き換える   | なし   | なし     |
| DELETE     | 指定のリソースを削除する     | なし   | あり     |

- 安全性: 安全性があるということは、リソースへの影響がないことを示す
- べき等性: べき等性があるということは、同一のリソースに対して同一の操作をしてもリソースの状態が同一であることを示す

他にも、`HEAD`、`OPTIONS`、`TRACE`とあるが今回は省く。

#### GET

単一もしくは複数リソースの取得に使用する。GET時はボディにペイロードを含まない。GET時の絞り込みはクエリパラメータで表現するが、何かしらの影響でURIに対するバイト制限がある場合はPOSTを使用すると良い。

GETのステータスコードは、リソースが存在する場合は`200`(リストが空の場合も)を、リソースが存在しないもしくはリスト自体が存在しない場合は`404`を返却する。

#### POST

指定したURIに新しいリソースを追加するときに使用する。POSTはべき等でないため、同一リクエストが来た場合はリソースの状態によって結果が異なる。

POSTのステータスコードは以下のように使い分ける。

- リソースが更新された場合は`200`を返却する
- リソースが作成された場合は`201`を返却する
- リクエストを受け付けたが処理が終了しない場合は`202`を返却する

#### PUT

単一リソース全体の更新に使用する。まれに、リソースの作成に利用することもあるが、PUTはボディのペイロードに指定されたもので既存のリソースを置き換えるという意味であるため、基本的にはリソース作成はPOSTを利用する。また、PUTは常に[べき等である](https://datatracker.ietf.org/doc/html/rfc7231#section-4.3.4)ことに注意する。2回同じリクエストが来てもリソースの状態は同じである必要がある(レスポンスコードを一致させるところまでは求められない)

PUTのステータスコードは以下のように使い分ける。

- リクエストが成功したかつ、レスポンスとして更新後のオブジェクトを返却する場合は`200`を、レスポンスを何も返却しない場合は`204`を返却する。
- リソースが作成された場合は`201`を返却する

#### PATCH

単一リソースの一部を更新する時に使用する。POSTと同様でべき等ではない。

PATCHのステータスコードは、PUTと同様で、リクエストが成功したかつ、レスポンスとして更新後のオブジェクトを返却する場合は`200`を、レスポンスを何も返却しない場合は`204`を返却する。

#### DELETE

指定したリソースを削除する。削除時のボディにペイロードは不要。

DELETEのステータスコードは、以下のように使い分ける。

- リクエストが成功し、レスポンスに削除したリソースを返却する場合は`200`を、何も返却しない場合は`204`を返却する
- リクエストに失敗した原因が、リソースが見つからない場合は`404`を、すでに削除済みである場合は`410`を返却する

### バックエンドに影響されたAPIを作らない

APIを作る時は、URIやボディのペイロードのプロパティにバックエンドの影響を受けないように注意する。APIを利用する側は、通常バックエンドの構成がどうなっているか関心はないはずだが、作成者と利用者が同一であると混同することがある。

例えば、性格診断のようなAPIがあり、月に10回まで出来るという制約があったとする。この月に10回という制限をAPIで表してしまうと、回数や月という単位が変わった時にAPIが影響を受けてしまうため、以下のように表現する。

- 診断を行う場合は、`POST https://api.janx2.info/personality-diagnoses`
  - 仮に上限を超えていた場合は`400`を返却する
- 今月の診断状況を取得するAPIから残回数や消費数、最大回数などの情報を取れるようにする
  - `GET https://api.janx2.info/personality-diagnoses/statuses`

### レスポンスのフィールドを選択できる

RESTful APIの場合は汎用的な使われ方を想定するため、どうしてもレスポンス時のデータ量が多くなってしまう。レスポンスのデータ量が多い場合は、ネットワークのトラフィックを圧迫し、クライアントの処理にも影響を及ぼす可能性がある。それに備え、API提供者は必要なフィールドのみを選択できるようにしておくと良い。

フィールドの選択は、クエリパラメータを使用する。例えば、`https://api.janx2.info/users/me`に対して名前だけ取得する場合は`https://api.janx2.info/users/me?fields=name`となる。複数ある場合は、`https://api.janx2.info/users/me?fields=name,age`とカンマ区切りで表現する。

fieldsが省略されている場合は、全てのフィールドを返却する。

### APIバージョン管理と強制バージョンアップ

APIを管理する上でAPIの変更は避けて通れない。変更は破壊的な変更を含む場合とそうでない場合があるが、破壊的な変更がある場合、クライアントは新しいAPIに準拠しないと常にエラーが発生してしまう状態となる。そのような場合はクライアント側のアップデートが必要となるが、ユーザーが常に最新の状態にしてくれるとは限らない。そのため、APIのバージョン管理を行いながら、クライアントの強制バージョンアップを出来る仕組みを整えておく必要がある。

APIのバージョン管理には[セマンティク バージョニング](https://semver.org/lang/ja/)を利用すると良い。これはバージョン体系をメジャーバージョン、マイナーバージョン、パッチバージョンという3つの要素で構成している。例えば、`1.2.3`というバージョンの場合は、メジャーバージョンが1、マイナーバージョンが2、パッチバージョンが3となる。これはドキュメントが整理されており、かつ使用されているケースが多いためこちらを利用すると良い。

強制バージョンアップは、基本的にはAPIに対して破壊的な変更があった場合に強制バージョンアップが出来るようにすると良い。これをどのように判断するかは色々あるが、一つの案としては、最新のAPIバージョンを取得する仕組み(例えば、APIバージョンを返すAPIを用意する)を用意しておき、クライアントが保持する現在のバージョンと比較し、メジャーバージョンに差分がある場合に強制バージョンアップを促す。という仕組みがある。

強制バージョンアップはネイティブアプリであれば、ストアへの誘導、ブラウザであればリロードという形になる。

また、APIの破壊的な変更は利用者側からすると(特にLSUDsの場合は)急に行われると困るため、APIバージョンの移行期間を設けながら徐々にAPIを切り替えていくと良い。

## こういう場合どうするか

### リソースが単一である場合の表現方法

リソースが単一で存在する場合は、以下の3パターンがある([参考: Singular (Singleton) Resource パターン](https://rest-pattern.hatenablog.com/entry/singular-resource))

- 対象リソースがグローバルである場合
  - `/setting`
- 対象リソースがサブリソースである場合
  - `/items/{id}/information`
- 対象リソースがセッション(private resource)である場合
  - `/me/profile`

### SSKDs(Small Set of Known Developers)とAPI設計

基本SSKDｓの場合は内部APIになるため、クライアント(ブラウザ、ネイティブアプリなど)に合わせて作るのが望ましい。しかし、ある程度特化した作りとなると汎用性だったり、拡張性が失われる。その場合は、オーケストレーション層(今で言うBFFのような概念)を用意し、クライアントのための中間層を用意すると良い。

オーケストレーション層では、クライアントからの1リクエストで複数のAPIを呼び出したり不要なレスポンスを削除したりといったことを行い、レスポンスを返す。そうすることでクライアントはたくさんのAPIを呼び出す必要がなくなり、バックエンド側も都度APIを作成する必要がなくなる。しかし、オーケストレーション層という新たな層が出来るためメンテナンスコストが増えることはデメリットとなる。

#### 参考

- [Embracing the Differences : Inside the Netflix API Redesign](https://netflixtechblog.com/embracing-the-differences-inside-the-netflix-api-redesign-15fd8b3dc49d)

### Appendix

- [Hypertext Transfer Protocol (HTTP/1.1): Semantics and Content - RFC 7231](https://datatracker.ietf.org/doc/html/rfc7231)
