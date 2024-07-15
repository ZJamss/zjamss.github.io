## 开发环境搭建

### 下载并安装node.js

略

### 使用npm全局安装ts

```bash
npm i -g typescript
```

### 使用tsc编译ts文件

```bash
tsc xxx.ts
```

## 类型声明

变量类型声明

```typescript
let a: number; //声明变量
let b: number = 123; //声明并赋值
let c = 123; //自动识别类型
let d: 10; //字面量声明类型，只能赋值为此字面量
```

形参类型和返回值类型声明

```typescript
function myf(a: number, b: number): number{
    return a + b
}
```

## 类型

![image-20240313165458804](ts.assets/image-20240313165458804.png)

### `any`

变量类型设置为`any`,TS将不会对其进行类型检查,可以随意赋值

```typescript
let a; //默认为any
let b: any;
b = 1;
b = 'ca';
b = false;
let c: string = b;
```

`any`类型可以给任意类型赋值

### `unknown`

类型安全的`any`，不能赋值给其他变量，如果必须赋值，则需要做一个类型检查或者类型转换

```typescript
let e: unknown = "as"
let a: string
a = e //报错
if(typeof e === 'string'){
    a = e //赋值成功
}
a = e as string //类型转换
a = <string>e
```

### `nerver / void`

如果函数没有返回值，则其默认返回值为`void`,意为没有值

`never`意味着永远都没有值，当函数陷于自旋，或者抛出异常等情况，返回值可以为`never`

```typescript
function  fn():never {
   throw new Error()
}

function  fn():never {
   //报错 A function returning  never  cannot have a reachable end point
}
```

### `object`

```typescript
let b: { a: number, b: number } = {a: 1, b: 2}  //OK
let b: { a: number, b: number } = {a: 1}  // 声明之后的参数必须全部写全，否则会报错
let b: { a: number, b?: number } = {a: 1}  // OK，在属性后面加一个?意味着可选属性，可以不写
```

声明一个对象，且只能使用声明过的属性，如果动态声明/创建属性，使用以下语法

```typescript
let b: { a: number, [props:string] } = {a: 1}  
b.c = 2
b.test = b.d;
```

### `function`

声明一个函数变量

```typescript
let b: (a: number, b: number) => number;
b = (a, b) => {
    return a + b;
}

let c = (a: number, b: number): number => {
    return a + b;
}
```

### `array`

```typescript
let arr: string[]
let a = [1,3,4,5]
```

声明一个数组

### `tuple`

固定长度为2的数组

```typescript
let tuple = [1, 2];
let tuple2: [a: number, b: object] = [1, {
    a: 1,
    b: 2
}]
```

### `enum`

定义一个枚举

```typescript
enum Gender {
    Male = 1,
    Female //是number则依次递增, 这里为2, 其余类型需要手动依次赋值
}

let a: Gender = Gender.Male
console.log(a)
```

打印出的值为枚举类型的值 `1` ,

### 联合类型和类型别名

```typescript
type mytype = string
let a: number | mytype
a = 1
a = 'a'
```

代表`a`可以为`number`类型也可以为`string`类型, `mytype`是`string`的别名

## 配置文件

`tsconfig.json` ts编译器的配置文件

**`include`**

指定哪些ts文件需要被编译，默认编译所有ts文件

默认值:` ['**/*']`

```json
{
  "include": [
    "./src/**/*"
  ]
}
```

`**` 表示所有文件夹

`*` 表示所有文件

**`exclude`**

指定哪些ts文件不需要被编译

默认值: `['node_modules","bower_components","jspm_packages"]']`

```json
{
  "exclude": [
    "node_modules"
  ] 
}
```

**`extends`**

继承配置文件

```json	
{
  "extends": "./xxx.json"
}
```

**`files`**

指定需要被编译的文件，文件少的时候可以用	

```json
{
  "files": [
    "xx.ts",
    "xxx.ts"
  ]
}
```

### **complierOptions 编译选项**

**`target`**

指定ts被编译成的ES版本

```json
{
  "compilerOptions": {
    "target": "ES6"
  }
}
```

**`module`**

指定使用的模块化规范

> export and import things

```json
{
  "compilerOptions": {
    "module": "es2015"
  }
}
```

**`lib`**

配置es所需要的库

```json
{
  "compilerOptions": {
    "lib": ["dom",..] //获取dom操作的库: document..
  }
}
```

**`outDir`**

指定编译好的js输出目录

```json
{
  "compilerOptions": {
    "outDir": "./dist"
  }
}
```

**`outFile`**

将编译好的js合并为一个文件

```json
{
  "compilerOptions": {
    "outDir": "./dist/index.js"
  }
}
```

> 如果需要合并使用了模块的代码，需要将`module`改成`system`或者`amd`模块规范

**`allowJs`**

是否对js文件进行编译，默认为`false`

```json
{
  "compilerOptions": {
    "allowJs": false
  }
}
```

**`checkJs`**

检查js是否符合ts语法规范，默认为`false`

```json
{
  "compilerOptions": {
    "checkJs": false
  }
}
```

**`removeComments	`**

默认为 `false`

是否移除注释

`[true | false]`



**`removeComments	`**

默认为 `false`

是否移除注释

`[true | false]`



**`noEmit	`**

默认为 `false`

不生成编译后的文件

`[true | false]`





**`noEmitOnError	`**

默认为 `false`

如果编译有错就不生成编译后的文件

`[true | false]`



**`alwaysStrict	`**

默认为 `false`

开启严格模式

`[true | false]`



**`noImplicitAny	`**

默认为 `false`

不允许没有显式声明类型的变量都默认为`any`

`[true | false]`



**`noImplicitThis	`**

默认为 `false`

不允许不明确类型的`this`

`[true | false]`



**`strictNullChecks	`**

默认为 `false`

严格检查`null`，有可能为`null`的情况编译不通过

`[true | false]`



**`strict	`**

默认为 `false`

所有严格检查的总开关

`[true | false]`



## 类

**建立类方法**

```typescript
class Person {
    static id?: number = 1  //设置静态属性
    private name: string //设置私有属性
    readonly age?: number = 20 //设置只读属性，不能更改

    //构造函数。public的属性会默认创建，不需要显示声明
    constructor(id: number, name: string, age: number, public readonly addr: string) {
    }

    //类方法，不加static就是成员方法
    static say(): string {
        return 'Hello'
    }
    
    // 索引签名，可以对对象添加任意属性与值
    // any代表任意类型，换成其他即可限制类型
    // 比如p.aa = '13' p.sad = true
    // [prop: string]: any 

    
}

let p: Person = {name: '23', age: 18, addr: '23'}
console.log(Person.id)
console.log(p.age)
console.log(p.addr)
Person.say()
```



**继承**

```typescript
class Person {
    constructor(public name: string, public age: number) {
    }

    say() {
        console.log("Person")
    }
}

class Student extends Person {
    constructor(public name: string, public age: number) {
        super(name, age);
    }

    // 重写父类方法
    say() {
        console.log("Student")
    }
}

let s: Person = new Student("stuu", 12);
s.say() //Student
```



**抽象类**

```typescript
abstract class Person {

    say() {
        console.log("Person")
    }

    abstract hello(): string
}
```

## 接口

定义类的结构，可以有属性和方法，但不能初始化属性和方法体，

一个类可以继承多个接口

接口也可以继承接口，使用`extends`关键字

```typescript
interface Person {
    name: string

    hello(): string
}

class Student implements Person {
    // 隐式声明name属性，符合接口结构
    constructor(public name: string, public age: number) {
    }

    hello(): string {
        return "";
    }
}
```

## 泛型

**类/接口泛型**

```typescript
class Person<T> {
    name: T
}

let p = new Person<string>()

// 继承泛型
interface Person<T> {
    name: T
}

class PersonImpl implements Person<string>{
    name: string;
}
```



**方法泛型**

```typescript
// 定义泛型
function fn<T, K>(a: T, b: K): T {
    return a;
}

//使用泛型
console.log(fn<string,number>('abc',13))

//其他
interface Person {

}

function fn<T extends Person>(a: T): T {
    return a;
}

```

