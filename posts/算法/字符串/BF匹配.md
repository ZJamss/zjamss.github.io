链接：https://blog.csdn.net/yyzsir/article/details/89462339

### BF字符串暴力匹配（朴素算法)

###### 什么是字符串的模式匹配？

在主串S内讯在是否存在子串T为模式匹配，S为字符串，T为模式

规定i为S的下标，j为T的下标，假定现在主串匹配到i位置，模式匹配到i位置

```java
 int bf(char[] S, char[] T) {
        int i = 0, j = 0;
        while (S[i] != '\0' && T[j] != '\0') {
            if (S[i] == T[i]) {
                i++;
                j++;
            } else {
                i = i - j + 1;
                j = 0;
            }
        }
        if (T[j] == '\0') return (i - j);
        else return -1;
    }
```

在第一次匹配中,i,j从0开始，在i=2,j=2时匹配失败

此时i=i-j+1,j=0（i回溯到之前匹配的位置的下一位，j重新开始匹配）

**i = i - j + 1; 将匹配成功的部分减去，回溯到原始匹配位置并往后移动一位开始新匹配**


### 匹配流程

![](file://C:\Users\17419\Documents\IkMarkdown\.assets\BF匹配.md1698.3346937.png)

![](file://C:\Users\17419\Documents\IkMarkdown\.assets\BF匹配.md1705.1521605.png)

![](file://C:\Users\17419\Documents\IkMarkdown\.assets\BF匹配.md1712.224434.png)

![](file://C:\Users\17419\Documents\IkMarkdown\.assets\BF匹配.md1724.653593.png)

![](file://C:\Users\17419\Documents\IkMarkdown\.assets\BF匹配.md1729.9217081.png)

![](file://C:\Users\17419\Documents\IkMarkdown\.assets\BF匹配.md1745.6839063.png)
