---
title: useSWRのキー名にFunction.nameを使ってはいけない
date: "2021-06-28T01:00:00+0900"
tags: ["useSWR", "SWR", "TypeScript", "JavaScript"]
---

useSWRに使用するキー名にFunction.nameを使うと意図しない挙動をする可能性があるという内容です。

## useSWRとは

[useSWR](https://swr.vercel.app/ja)はVercelが提供してくれている `stale-while-revalidate` を由来としたキャッシュ戦略に有用なライブラリです。

以下のように、fetcherと呼ばれる部分がAPI通信部分となり、useSWRの第一引数をキー名として、そのキーに対してrevalidateをしたり、キャッシュを返したりと、キーを中心に機能します。

※useSWRの細かな話は省きます

```ts
const fetcher = (url) => fetch(url).then(r => r.json())
useSWR('/api/data', fetcher)
```

## useSWRとminify

私の職場ではAPI部分をOpenAPIから自動生成しており、関数名が実質APIパスを表すようなわかりやすい名前になっています。useSWRの導入に当たり、キー名は重複しないようにかつ、一定のルールを持って決めることを考えた時に自動生成される関数名をキーにしようと考えました。

コードで表すと以下のような感じです。

```ts
export const useAnimal = () => {
  const key = AnimalAPI.v1AnimalGets.name;
  const fetcher = (url) => fetch(url).then(r => r.json())
  const {data} = useSWR(key, fetcher)

  return {data}
}
```

これで実装を進めていると、fetcherの型に合わないレスポンスが返却されていることが原因でスクリプトエラーが発生するようになりました。サンプルはイメージですが、実際に発生した事象と同じです(また、ローカル環境では発生せず、プロダクションビルド時に発生していました)。

```ts
const {animalData} = useAnimal();
const {carData} = useCar(); // carDataを参照するとなぜかanimalDataが入っている

// length propertyがないというエラーが発生する
const isEmpty = useMemo(() => carData.name.length === 0, [carData.name])
```

このとき中で何が起こっていたことをコードで表すとこんな感じになります。

```ts
export const useAnimal = () => {
  const key = AnimalAPI.v1AnimalGets.name; // 実行時にkeyが value という文字列になる
  const fetcher = (url) => fetch(url).then(r => r.json()) // valueというキーに対してfetchとキャッシュが行われる
  const {data} = useSWR(key, fetcher)

  return {data}
}

export const useCar = () => {
  const key = CarAPI.v1CarGets.name; // こちらも実行時にkeyが value となっている
  const fetcher = (url) => fetch(url).then(r => r.json()) // valueキーは先ほどfetchしたためキャッシュから値が返される
  const {data} = useSWR(key, fetcher)

  return {data}
}

const {animalData} = useAnimal();
const {carData} = useCar(); // carDataを参照するとなぜかanimalDataが入っている
// carDataにはanimalDataが入り、carDataにあるname属性は存在しないためエラーとなってしまう
const isEmpty = useMemo(() => carData.name.length === 0, [carData.name])
```

コメントを見てもらえると分かるとおり、Function.nameを使った部分が、期待値としてはAPIパスとなるnameが取れるはずがどちらも`value`という文字列がキー名となってしまいました。

Function.nameについて調べていると、MDNにこんなことが書いてありました。

> 警告: Function.name を使用しているときに、 JavaScript の圧縮 (ミニファイ) や難読化のような変換を行う際には注意が必要です。これらのツールは JavaScript ビルドパイプラインの一部として、本番環境に設置する前にプログラムのサイズを縮小するためによく使用されます。それらの変換は、ビルド時に関数名を変更することがあります。

[JavaScript の圧縮とミニファイから抜粋](https://developer.mozilla.org/ja/docs/Web/JavaScript/Reference/Global_Objects/Function/name#javascript_compressors_and_minifiers)

そうですね、minifyされ、期待していたキー名ではなくなり、minifyされた状態の関数名を取得していました。またそれがバッディングしていたため今回のような結果となりました。

結果としてはFunction.nameはminifyされるんだから使っちゃだめ。ということは分かるのですが、そこに気づくまでに時間がかかってしまいました(特に実際のコード部分がminifyの影響を受けるということを考えて実装することは少ないです(筆者目線))。

## まとめ

結論は、 `Function.name` はプロダクションレベルにおいては使うのを控えましょう。
