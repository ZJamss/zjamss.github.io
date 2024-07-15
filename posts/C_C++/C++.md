## 语法

### 编译器和链接器

先编译后链接，**编译是指将文件按照一定规则编译**，在此就是按照C++风格编译，**无论文件后缀**,然后生成对应的`.obj`文件



链接是将工程中每一个obj文件链接起来形成一个`exe`文件

> 在一个cpp文件中引用了其他文件的函数，需要在本文件使用函数前写上函数声明，在链接的过程中链接器会自动寻找对应的函数，**但一个工程中不能有相同名称的函数，否则会链接失败，但加上static关键词可以声明函数仅在本文件使用，可以让链接器排除**



### 预编译指令

#### #include

include是将引用的文件中的内容替换到本文件中，在编译之前执行

##### 为什么.h头文件中只写定义不写实现

若在头文件中写上函数的定义，多个文件引用此头文件的话，就会出现多个相同的函数定义，在链接的阶段会失败，所以只写定义，实现在一个cpp文件中，在链接阶段不会造成链接失败

#### #pragma once

确保在同一编译单元内的多次引用只有一次有效，防止重复声明

#### #ifndef xxx #endif

设置一个域，在内`#define xxx`，和`pragma once`效果差不多，保证里面的内容只被引用一次，但是比前者更灵活

### 类和结构体

类默认private,结构体默认public

### static和extern

被extern标记的变量**不可赋值**，此提醒linker前往其他翻译单元寻找变量

#### static全局变量

意味着该变量仅在本翻译单元中使用，linker不会将它链接至其他文件的同名变量

#### static在类/结构体中

静态成员变量是唯一存在的，和Java中的类似,多个实例也只有一个静态变量

static标识变量时，需要**在类外定义**,赋值操作也在类外发生

```c++
class Type {
public:
	static const int x;
};
const int Type::x = 10;
```

可以使用`类名::变量名`的形式调用 如`Type::x`

静态方法**不需要类外写定义**同时静态方法中**不能使用非静态变量和方法**



### ENUM枚举

```c++
class Type {
public:
	enum N
	{
		A = 0, B, C
	};
};
int main() {
	std::cout << Type::A;;
};
```



可以在类中定义也可以单独定义，使用可以`类::(枚举名::)枚举变量`

### 继承

`private` 仅类中或友元可见

`protected`  仅类中和子类

`public` 类内类外皆可

```c++
class A : public Type {
};
```

后面的`public`权限修饰符代表将父类继承的所有`public`属性也转为公开，若写`private`修饰符则转为私有

> 只能使用父类public的属性和方法，但private的也会继承，不过不能使用

#### 虚函数

虚函数可以写上默认实现，子类不需要覆写也能调用

```c++
class Type {
public:
	virtual void demo() { ... }

};

class A : public Type {
public:
	 void demo() override {
};
```

#### **虚析构函数**

在使用多态继承的子类时，如

```c++
Base* B = new Son();
delete B;
```

此时执行的析构函数将只会有父类`Base`的析构函数

将父类的析构函数设为`virtual`，子类覆写之后，则会执行

#### 纯虚函数/接口

在类中将方法定义为

```c++
virtual void demo() = 0;
```

则意味着该方法为纯虚函数，需要子类覆写，否则无法实例化子类，同时父类永远也无法被实例化且父类被称之为**接口**



### 字符串

```c++
const char* str = "123";
```

`str`指针指向一个**字符串字面量**，其存在于一块**只读的内存区域**，是不能修改的，所以必须加上关键词`const`

### CONST

```c++
const int* a = new int
```

`const int*/int const*`代表可以改变指针所指向的内存地址，但是不能改变内存存储的值

```c++
int*const a = new int
```

此时相反可以改变内存存储的值，但不能改变指向的地址

```c++
const int* const a = new int
```

此时既不能改变指向的地址也不能改变值

```c++
class A{
    int X;
    void GetX() const{
        return X;
    }
}
```

**成员函数后加`const`**声明此函数不会改变类的状态

若实在需要在`const函数`内修改变量，将变量设为`mutable`即可

```c++
class A{
    mutable int X;
    void GetX() const{
        return X;
    }
}
```

### 初始化成员列表

```c++
class class_A{
    int m_x;
    class_B m_b;
    class_A(int x):m_x(x),m_b(class_B()){}
}
```

在构造函数后使用`:xx(xx)`的形式也可以初始化函数，此种方法创建对象时可以**避免额外的性能开销**

> 就算在定义类的对象成员时，如上的`class_B m_b`，**在使用传统构造函数的会默认创建对象**，如果在构造函数中再给变量赋值，则就会**覆盖原有的对象**，造成性能浪费，使用初始化成员列表就不会出现默认创建对象的情况，只会直接赋值（`int`等**基本类型不会默认赋值**）

### 运算符重载

```c++
class Vec {
private:
	float m_x, m_y;
public:
	Vec(float x, float y) :m_x(x), m_y(y) {};
	float getX() const {
		return m_x;
	}
	float getY() const {
		return m_y;
	}
	Vec operator+ (const Vec& other) const{
		return Vec(this->m_x + other.m_x, this->m_y + other.m_y);
		
	}
	void operator<<(std::ostream& os) const {
		os << this->m_x << '-' << this->m_y << std::endl;
	}
};

// 重载ostream的<<运算符
std::ostream& operator<<(std::ostream& os, const Vec& vec) {
	os << "[VEC]: "<<vec.getX() << "," << vec.getY() << std::endl;
	return os;
}

```

分为**类成员重载运算符**和**全局函数重载运算符**

类成员**一般要么没有参数，要么只有一个参数**，出现在运算符**右边**

全局函数有**两个参数**，**第一个在左边第二个在右边**，如上所示

### 智能指针

使用前需要`#include<memory>`

#### `unique_ptr`

作用域指针

```c++
std::unique_ptr<Vec> v = std::make_unique<Vec>(...选填构造参数); //创建方式异常安全，构造函数报错可以捕捉
std::unique_ptr<Vec> v2(new Vec(1.f, 1.f)); //不安全
```

指针可以移到新所有者，但不会复制(引用可以)或共享，在作用域结束后自动销毁

```c++
std::unique_ptr<Vec> v = std::make_unique<Vec>();
std::unique_ptr<Vec> v2 = v; //报错
```

```c++
int main() {
	{
		std::unique_ptr<Vec> v = std::make_unique<Vec>(1.f,1.f); //创建
		std::cout << *v.get();
	} //释放内存
}
```

#### `shared_ptr`

共享指针，与`unique_ptr`的区别是会维持一个**计数器**，来计算当前指针被引用的数量，**当计数为0时就会释放内存**，**可以被赋值给其他指针**

```c++
int main() {
	{
		std::shared_ptr<Vec> v; //创建变量
		{
			std::shared_ptr<Vec> v2 = std::make_shared<Vec>(); //创建实际内存空间,计数器+1
			v = v2; //计数器+2
		} //v2销毁，计数器-1
		std::cout << *v << std::endl;
	} //v销毁，计数器=0
    // Destoryed
}
```

#### `weak_ptr`

弱指针，和共享指针的区别就是不会增加引用数，如下

```c++
int main() {
		std::weak_ptr<Vec> v;
		{
			std::shared_ptr<Vec> v2 = std::make_unique<Vec>(); // 创建，计数+1
			v = v2; // 不增加计数
			std::cout << v.expired() << std::endl; // 0，对象存活
		} // 计数-1，Vec对象销毁
		std::cout << v.expired() << std::endl; // 1，对象失效
}
```

#### 拷贝构造函数

```c++
class String {
private:
	char* m_Buffer; //深拷贝重点,指针
	unsigned int m_Size;
public: 
	String(const char* string) {
		m_Size = strlen(string);
		m_Buffer = new char[m_Size + 1];
		memcpy(m_Buffer, string, m_Size);
		m_Buffer[m_Size] = '\0';
	}
	~String() {
		delete[] m_Buffer;
	}

	friend std::ostream& operator<<(std::ostream& os, String& string);
};
```

**每个类会有一个默认的拷贝构造函数**，其定义为 `类名(const 类名& xxx)`，实现类似于如下

```c++
	String(const String& other) { // 拷贝构造函数
		memcpy(this, &other, sizeof(String)); //将对应内存区域全部复制过来,这里的m_Buffer不是数据而是指针，所以重复了
	}
```

或者

```c++
	String(const String& other):m_Buffer(other.m_Buffer),m_Size(other.m_Size){} // 拷贝构造函数
```



如果直接使用只会**复制值**，造成多个指针指向一个内存区域，释放的时候就出大问题

所以能实现**深拷贝**的拷贝构造函数如下所示

```c++
	String(const String& other):m_Size(other.m_Size){
		m_Buffer = new char[m_Size + 1]; // 开辟一块新的内存空间
		memcpy(m_Buffer, other.m_Buffer, other.m_Size + 1); // 将原来的buffer内容全部复制到新的内存空间中，而不是直接复制buffer的地址
	}
```

### 获取成员变量偏移量

```c++
int main() {
	int offset_x = (int)&((Vec*)0)->m_x;
	int offset_y = (int)&((Vec*)nullptr)->m_y;
	std::cout << offset_x << " " << offset_y << std::endl;
}
```

### 动态数组vector

可变长数组，大差不差

```c++
int main() {
	std::vector<Vec> vec;
	vec.push_back(Vec()); //复制Vec进行赋值，每次增长都会重新复制一份已有的，可以采用vec.reserve(int)设置size,避免同一对象多次复制
	vec.push_back(Vec(2.2f,2.1f));
 
    //	vec.emplace_back();
    // 	vec.emplace_back(2.2f,2.1f);  采用emplace_back告诉vector直接使用传递的参数创建Vec对象

	for (Vec& v : vec) { // 采用引用，避免复制
		std::cout << v << std::endl;
	}
	vec.erase(vec.begin() + 1); //vec.begin()返回一个iterator，代表着第一个值，往后一次+1
		for (Vec& v : vec) {
		std::cout << v << std::endl;
	}
}
```

```c++
int main() {	
	std::vector<Vec*> vec;
	vec.push_back(new Vec()); //不会复制Vec，因为是指针，性能还好
	vec.push_back(new Vec(2.2f,2.1f));
	for (Vec* v : vec) {
		std::cout << *v << std::endl;
	}
	vec.erase(vec.begin() + 1); //移除第二个Vec之后指针指向的内存不会自动析构，可能有其他方法可以调用
	for (Vec* v : vec) {
		std::cout << *v << std::endl;
	}
}
```

```c++
int main() {	
	std::vector<std::unique_ptr<Vec>> vec; //使用智能指针
	vec.push_back(std::make_unique<Vec>());
	vec.push_back(std::make_unique<Vec>(1.1f,2.2f));
	for (std::unique_ptr<Vec>& v_ptr : vec) {
		std::cout << *v_ptr << std::endl;
	}
	vec.erase(vec.begin() + 1); // 移除后对象析构
	for (std::unique_ptr<Vec>& v_ptr : vec) {
		std::cout << *v_ptr << std::endl;
	}
}
```

### 动静态库链接方法

**静态**： 

- 将`include`头文件夹作添加到`C\C++ \常规\附加包含目录`，引用其中的头文件至代码即可
- 将对应`lib`的文件夹添加到`链接器\常规\附加库目录`即可
- 将需要的`lib`的名字添加到`链接器\输入\附加依赖项`即可

**动态：**

- 与静态库大体相同，区别是第三步引用的库文件有区别
- 然后将`dll`文件放在`exe`文件同一目录下即可

### 模板

方法模板/类模板

```c++
template<typename T,int N>
class Array{
private:  
    int m_Array[N];
public:
    int getSize() const {
        return N;
    }
};

template<typename T>
void Print(T value){
    std::cout<<value<<std::endl;
}

int main(){
    Array<std::string,5>array;
}
```

### lambda

**语法：**

```c++
[捕获](参数){内容}
```

```c++
#include<iostream>
#include<vector>
#include<functional>

void display(const std::vector<int>& vec, const std::function<void(int)>& func) {
	for (int value : vec) {
		func(value);
	}
}


int main() {
	std::vector<int> vec = { 1,2,3,4,5,6 };
	int a = 3;
	display(vec, [&a](int value) mutable {
		std::cout << &a << std::endl;
		a = 4;
	});
	std::cout << a << std::endl;
}
```

- 捕获：可以将上文的变量传入函数体中使
  - `=` **代表全部值传递**
  - **`&`代表全部引用传递**
  - **&变量名可以引用传递单个变量，可以修改值**
  - **只写变量名代表值传递单个变量，不能修改，除非在后面加上`mutable`**
- 参数列表：正常写

要想将**lambda作为参数传递**，需要引用头文件`<functional>`，形式为`std::functional<lambda函数返回值类型(参数类型)>`

### 命名空间

```c++
namespace xxx{}
```

避免函数变量等命名冲突 ,over

### 类型双关

```c++
int main() {
	Entity e{ 1,2 };
	int* array = (int*)&e; // 转为int指针
	std::cout << array[0] << "-" << array[1] << std::endl;
}
```

#### struct 内存对齐 / union

待解

### C++类型转换

#### Dynamic_cast

仅能将变量转换为**可以访问**(`public继承`)的基类，类层次结构中向上转换

前提：

```c++
class A{};
class B : public A{};
B* b = new B();
```

如果想将`B`转为类`A`使用，除了直接`(A*)b`之外，可以使用更安全的动态转换

```c++
A* a = dynamic_cast<A*>(b);
```

#### const_cast

仅当使用来改变变量的`cosnt`和`volatile `属性，基本用于删除，添加可以直接写

但结果是不确定的，有时候不一定能真正删除`const`实现修改值的效果

```c++
const A* a = new A();
A* b = a; // invalid
A* b = const_cast<A*>(a); // valid
```

#### static_cast

能被显式转换的类型都能使用`static_cast`,比如**父子类之间互转**,`int,double`之间等等

#### reinterpret_cast

有点类似于**类型双关**的转换,可以将一种类型的变量**当成另外一种类型看待**

```c++
	A* a = new A(1,2);
	B* b = reinterpret_cast<B*>(a);
	std::cout << a->a<<std::endl; // 1
	std::cout << a->b << std::endl; // 2
	std::cout << b->a << std::endl; // 13071
	// 00000000 00000010 00000000 00000001
```

## STL

### 1. **Vector（向量）**

```c++
#include <vector>

std::vector<int> myVector;
myVector.push_back(1);
myVector.push_back(2);
myVector.push_back(3);

int vectorElement = myVector[1];
for (std::vector<int>::iterator it = myVector.begin(); it != myVector.end(); ++it) {
    // 访问 *it
}
std::sort(myVector.begin(), myVector.end());
for (std::vector<int>::const_iterator it = myVector.begin(); it != myVector.end(); ++it) {
    // 访问 *it
}
```

### 2. **Deque（双端队列）**

```c++
#include <deque>

std::deque<int> myDeque;
myDeque.push_back(1);
myDeque.push_back(2);
myDeque.push_back(3);

int dequeElement = myDeque[1];
for (std::deque<int>::iterator it = myDeque.begin(); it != myDeque.end(); ++it) {
    // 访问 *it
}
myDeque.pop_front();  // 删除第一个元素
```

### 3. **List（链表）**

```c++
#include <list>

std::list<int> myList;
myList.push_back(1);
myList.push_back(2);
myList.push_back(3);

int listElement = myList.front();
for (std::list<int>::iterator it = myList.begin(); it != myList.end(); ++it) {
    // 访问 *it
}
myList.sort();
for (std::list<int>::const_iterator it = myList.begin(); it != myList.end(); ++it) {
    // 访问 *it
}
```

### 4. **Forward List（单向链表）**

```c++
#include <forward_list>

std::forward_list<int> myForwardList;
myForwardList.push_front(1);
myForwardList.push_front(2);
myForwardList.push_front(3);

int forwardListElement = myForwardList.front();
for (std::forward_list<int>::iterator it = myForwardList.begin(); it != myForwardList.end(); ++it) {
    // 访问 *it
}
myForwardList.remove(2);  // 删除特定值
```

### 5. **Queue（队列）**

```c++
#include <queue>

std::queue<int> myQueue;
myQueue.push(1);
myQueue.push(2);
myQueue.push(3);

int queueFront = myQueue.front();
myQueue.pop();  // 删除队首元素
```

### 6. **Priority Queue（优先队列）**

```c++
#include <queue>

std::priority_queue<int> myPriorityQueue;
myPriorityQueue.push(1);
myPriorityQueue.push(2);
myPriorityQueue.push(3);

int priorityQueueTop = myPriorityQueue.top();
myPriorityQueue.pop();  // 删除堆顶元素
```

### 7. **Stack（栈）**

```c++
#include <stack>

std::stack<int> myStack;
myStack.push(1);
myStack.push(2);
myStack.push(3);

int stackTop = myStack.top();
myStack.pop();  // 删除栈顶元素
```

### 8. **Array（数组）**

```c++
#include <array>

std::array<int, 3> myArray = {1, 2, 3};

int arrayElement = myArray[1];
for (std::array<int, 3>::iterator it = myArray.begin(); it != myArray.end(); ++it) {
    // 访问 *it
}
myArray.fill(0);  // 将所有元素设置为0
```

### 9. **Set（集合）**

```c++
#include <set>

std::set<int> mySet;
mySet.insert(1);
mySet.insert(2);
mySet.insert(3);

int setElement = *(mySet.find(2));
for (std::set<int>::iterator it = mySet.begin(); it != mySet.end(); ++it) {
    // 访问 *it
}
```

### 10. **Multiset（多重集合）**

```c++
#include <set>

std::multiset<int> myMultiSet;
myMultiSet.insert(1);
myMultiSet.insert(2);
myMultiSet.insert(2);

int multiSetCount = myMultiSet.count(2);
for (std::multiset<int>::iterator it = myMultiSet.begin(); it != myMultiSet.end(); ++it) {
    // 访问 *it
}
```

### 11. **Map（映射）**

```c++
#include <map>

std::map<std::string, int> myMap;
myMap["one"] = 1;
myMap["two"] = 2;
myMap["three"] = 3;

int mapValue = myMap["two"];
for (std::map<std::string, int>::iterator it = myMap.begin(); it != myMap.end(); ++it) {
    // 访问 it->first 和 it->second
}
```

### 12. **Multimap（多重映射）**

```c++
#include <map>

std::multimap<std::string, int> myMultiMap;
myMultiMap.insert(std::make_pair("one", 1));
myMultiMap.insert(std::make_pair("two", 2));
myMultiMap.insert(std::make_pair("two", 3));

int multiMapCount = myMultiMap.count("two");
for (std::multimap<std::string, int>::iterator it = myMultiMap.begin(); it != myMultiMap.end(); ++it) {
    // 访问 it->first 和 it->second
}
```

### 13. **Unordered Set（无序集合）**

```c++
#include <unordered_set>

std::unordered_set<int> myUnorderedSet;
myUnorderedSet.insert(1);
myUnorderedSet.insert(2);
myUnorderedSet.insert(3);

int unorderedSetElement = *(myUnorderedSet.find(2));
for (std::unordered_set<int>::iterator it = myUnorderedSet.begin(); it != myUnorderedSet.end(); ++it) {
    // 访问 *it
}
```

### 14. **Unordered Multiset（无序多重集合）**

```c++
#include <unordered_set>

std::unordered_multiset<int> myUnorderedMultiSet;
myUnorderedMultiSet.insert(1);
myUnorderedMultiSet.insert(2);
myUnorderedMultiSet.insert(2);

int unorderedMultiSetCount = myUnorderedMultiSet.count(2);
for (std::unordered_multiset<int>::iterator it = myUnorderedMultiSet.begin(); it != myUnorderedMultiSet.end(); ++it) {
    // 访问 *it
}
```

### 15. **Unordered Map（无序映射）**

```c++
#include <unordered_map>

std::unordered_map<std::string, int> myUnorderedMap;
myUnorderedMap["one"] = 1;
myUnorderedMap["two"] = 2;
myUnorderedMap["three"] = 3;

int unorderedMapValue = myUnorderedMap["two"];
for (std::unordered_map<std::string, int>::iterator it = myUnorderedMap.begin(); it != myUnorderedMap.end(); ++it) {
    // 访问 it->first 和 it->second
}
```

### 16. **Unordered Multimap（无序多重映射）**

```c++
#include <unordered_map>

std::unordered_multimap<std::string, int> myUnorderedMultiMap;
myUnorderedMultiMap.insert(std::make_pair("one", 1));
myUnorderedMultiMap.insert(std::make_pair("two", 2));
myUnorderedMultiMap.insert(std::make_pair("two", 3));

int unorderedMultiMapCount = myUnorderedMultiMap.count("two");
for (std::unordered_multimap<std::string, int>::iterator it = myUnorderedMultiMap.begin(); it != myUnorderedMultiMap.end(); ++it) {
    // 访问 it->first 和 it->second
}
```
