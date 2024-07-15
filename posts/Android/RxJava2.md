### 依赖

```kotlin
    implementation 'io.reactivex.rxjava2:rxjava:2.2.21+'
    implementation 'io.reactivex.rxjava2:rxandroid:2.1.1+'
```

### 自定义Observer

> 下面情景模拟登陆后根据登陆结果选择需要的数据

先创建`LoginResponse`(**响应体**)

包含内部类`User`是真正需要的数据

```java
package com.zjamss.rxjavatest;

/**
 * @Program: RxJavaTest
 * @Description:
 * @Author: ZJamss
 * @Create: 2022-02-23 15:48
 **/
public class LoginResponse {
    private Integer code;
    private String message;
    private User data;

    public LoginResponse(int code, String message, User data) {
        this.code = code;
        this.message = message;
        this.data = data;
    }

    public LoginResponse() {
    }

    public Integer getCode() {
        return code;
    }

    public void setCode(Integer code) {
        this.code = code;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public User getData() {
        return data;
    }

    public void setData(User data) {
        this.data = data;
    }

    class User{
        private String username;
        private String password;

        public User(String username, String password) {
            this.username = username;
            this.password = password;
        }

        public User() {
        }

        @Override
        public String toString() {
            return "User{" +
                    "username='" + username + '\'' +
                    ", password='" + password + '\'' +
                    '}';
        }

        public String getUsername() {
            return username;
        }

        public void setUsername(String username) {
            this.username = username;
        }

        public String getPassword() {
            return password;
        }

        public void setPassword(String password) {
            this.password = password;
        }
    }
}

```

再创建`LoginObserver`并**继承RxJava2的`Observer`接口**

```java
package com.zjamss.rxjavatest;

import androidx.annotation.NonNull;

import io.reactivex.Observer;
import io.reactivex.disposables.Disposable;

/**
 * @Program: RxJavaTest
 * @Description:
 * @Author: ZJamss
 * @Create: 2022-02-23 15:47
 **/
public abstract class LoginObserver implements Observer<LoginResponse> {

    abstract void loginSuccessfully(LoginResponse.User user);
    abstract void loginFailure(String message);


    @Override
    public void onSubscribe(@NonNull Disposable d) {

    }

    @Override
    public void onNext(@NonNull LoginResponse loginResponse) {
        if(loginResponse.getCode() == 200 && loginResponse.getData() != null)
            loginSuccessfully(loginResponse.getData());
        else
            loginFailure(loginResponse.getCode().toString()+" "+loginResponse.getMessage());
    }

    @Override
    public void onError(@NonNull Throwable e) {
        loginFailure(e.getMessage());
    }

    @Override
    public void onComplete() {

    }
}

```

将类设置为**抽象类**，并抽象出两个方法 `loginSuccessfully()`  `loginFailure()` 对应成功和失败的结果

重写`Observer`的方法，在`onNext()`**请求响应时判断响应体的数据**，**执行抽象的方法**，为他们传参，在`onError()`方法内执行`loginFailure()`方法



**模拟一个登陆函数**

```java
public static Observable<LoginResponse> login(String u, String p) {
        LoginResponse response = new LoginResponse();
        if (u.equals("z") && p.equals("z")) {
            LoginResponse.User user = response.new User(u, p);
            response.setData(user);
            response.setCode(200);
        } else {
            response.setCode(400);
            response.setMessage("账号或密码错误");
        }
        return Observable.just(response);
    }
```

**执行登陆流程**

```java
LoginObserver loginObserver = new LoginObserver() {
            @Override
            void loginSuccessfully(LoginResponse.User user) {
                Toast.makeText(MainActivity.this,"登陆成功 "+user.toString(),Toast.LENGTH_SHORT).show();
            }

            @Override
            void loginFailure(String message) {
                Toast.makeText(MainActivity.this,message,Toast.LENGTH_SHORT).show();

            }
        };

        cb.setOnClickListener(v->{
            Login.login("123","123")
                    .subscribe(loginObserver);
            try {
                Thread.sleep(3000);
            } catch (InterruptedException e) {
                e.printStackTrace();
            }
            Login.login("z","z").subscribe(loginObserver);
        });
```
