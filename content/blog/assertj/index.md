---
title: AssertJメモ
date: "2021-02-23"
tags: ["Java", "AssertJ", "テスト", "備忘録"]
---

AssertJは業務でよく使うのですが、忘れることが多いのでそのメモです。

## AssertJとは

JavaのTesting libraryです。 `assertThat` に続けてメソッドチェーンの形式で書いていきます。個人的にはわかりやすいのと、便利なメソッドが用意されているので好きです。

[本家](https://assertj.github.io/doc/)

インストールは上記QuickStartを参照ください。

ではコードを見ていきます。

## リスト系操作

まずよく使うアサーションの一つに `allMatch/anyMatch` があります。全て満たすか、一部満たすです。
あとは、リスト系の要素に対するオーダーのアサーションです。DBから引っ張ってきた値のオーダーが期待値になっているか、ソート結果が期待通りか見る時に利用します。

```Java
    @Test
    void listBasicAssertions() {
        List<String> list = List.of("hoge", "fuga", "piyo");

        // xxxMatch系
        assertThat(list).as("passed").allMatch(s -> s.length() == 4);
        assertThat(list).as("passed").anyMatch(s -> s.equals("hoge"));

        // order系
        assertThat(list).as("passed").containsExactlyInAnyOrder("hoge", "fuga", "piyo");
        assertThat(list).as("passed").containsExactly("hoge", "fuga", "piyo");
        assertThat(list).as("failed").containsExactly("hoge", "piyo", "fuga");
    }
```

次は、リスト系操作のさらに拡張版です。よくあるのが、取得してきた一部を検証したいパターンで、 `filteredOn` を利用します。あとは、テストの可読性をあげるという意味で、カスタムconditionを使用します。

```Java
    @Test
    void listAdvanceAssertion() {
        Todo todo1 = new Todo("task1", "gogo task1", TASK_STATUS.TODO, 0, 5);
        Todo todo2 = new Todo("task2", "gogo task2", TASK_STATUS.TODO, 0, 3);
        Todo todo3 = new Todo("task3", "gogo task3", TASK_STATUS.TODO, 0, 2);
        Todo todo4 = new Todo("task4", "gogo task4", TASK_STATUS.TODO, 0, 2);
        Todo todo5 = new Todo("task5", "gogo task5", TASK_STATUS.TODO, 0, 8);

        todo2.passedDay();
        todo2.next();

        todo3.passedDay();
        todo3.next();
        todo3.passedDay();
        todo3.next();
        List<Todo> todoList = List.of(todo1, todo2, todo3, todo4, todo5);

        // filter
        assertThat(todoList).as("passed").filteredOn(todo -> todo.getTaskStatus().equals(TASK_STATUS.TODO)).extracting(Todo::getPassedDay).containsOnly(0);
        assertThat(todoList).as("passed").filteredOn(todo -> todo.getPassedDay() == 0).extracting(Todo::getTaskStatus).containsOnly(TASK_STATUS.TODO);

        // custom condition
        assertThat(todoList).as("passed").filteredOn(isTodo).extracting(Todo::getPassedDay).containsOnly(0);
    }

    /**
     * custom condition
     */
    Condition<Todo> isTodo = new Condition<>() {
        @Override
        public boolean matches(Todo value) {
            return TASK_STATUS.TODO.equals(value.getTaskStatus());
        }
    };
```

## 例外系操作

例外系のテストを書くときに、例外が投げられること、例外が投げられないことを検証するときに使用します。

```Java
    @Test
    void exceptionAssertion() {
        Throwable throwable = catchThrowable(() -> {
            throw new Exception("bomb!!!");
        });

        assertThat(throwable)
                .isInstanceOf(Exception.class)
                .hasMessageContaining("bomb");

        assertThatThrownBy(() -> {
            throw new Exception("bomb!!!");
        })
                .isInstanceOf(Exception.class)
                .hasMessageContaining("bomb");

        assertThatCode(() -> {
            throw new Exception("bomb!!!");
        })
                .isInstanceOf(Exception.class)
                .hasMessageContaining("bomb");

        assertThatCode(() -> {
            System.out.print("bomb!!!");
        }).doesNotThrowAnyException();
    }
```

まずはよく忘れている部分だけあげました。あとは随時書いていこうと思います。
