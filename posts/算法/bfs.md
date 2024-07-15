# [广度优先搜索原理与实践](https://www.cnblogs.com/huansky/p/12826857.html)

## 概论

在  **[深度优先搜索原理与实践（java](https://www.cnblogs.com/huansky/p/12821889.html)）** 文章介绍了深度优先搜索算法的理论和实践。本文将介绍与其原理类似的广度优先搜索算法。

广度优先搜索（也称宽度优先搜索，缩写 BFS，以下采用广度来描述）是连通图的一种遍历算法这一算法也是很多重要的图的算法的原型。Dijkstra 单源最短路径算法和 Prim 最小生成树算法都采用了和宽度优先搜索类似的思想。其别名又叫 BFS，属于一种盲目搜寻法，目的是系统地展开并检查图中的所有节点，以找寻结果。换句话说，它并不考虑结果的可能位置，彻底地搜索整张图，直到找到结果为止。基本过程，BFS 是从根节点开始，沿着树(图)的宽度遍历树(图)的节点。如果所有节点均被访问，则算法中止。一般用队列数据结构来辅助实现 BFS 算法。

## 基本原理

对于下面的树而言，BFS 方法首先从根节点1开始，其搜索节点顺序是 1,2,3,4,5,6,7,8

![](https://img2018.cnblogs.com/blog/1402876/201812/1402876-20181210165600134-1573458941.png)

BFS 使用队列 (queue) 来实施算法过程，队列 (queue) 有着先进先出 FIFO (First Input First Output)的特性，

BFS 操作步骤如下：

* 把起始点放入 queue；
* 重复下述2步骤，直到 queue 为空为止：
* * 从queue中取出队列头的点；
* * 找出与此点邻接的且尚未遍历的点，进行标记，然后全部放入queue中。

下面结合一个图 (graph) 的实例，说明 BFS 的工作过程和原理：
（1）将起始节点1放入队列中，标记为已遍历：

![](https://img2018.cnblogs.com/blog/1402876/201812/1402876-20181210165653157-1845400317.png)

（2）从queue中取出队列头的节点1，找出与节点1邻接的节点2,3，标记为已遍历，然后放入queue中。

![](https://img2018.cnblogs.com/blog/1402876/201812/1402876-20181210165724498-649889295.png)

（3）从queue中取出队列头的节点2，找出与节点2邻接的节点1,4,5，由于节点1已遍历，排除；标记4,5为已遍历，然后放入queue中。

![](https://img2018.cnblogs.com/blog/1402876/201812/1402876-20181210165806664-2133405348.png)

（4）从queue中取出队列头的节点3，找出与节点3邻接的节点1,6,7，由于节点1已遍历，排除；标记6,7为已遍历，然后放入queue中。

![](https://img2018.cnblogs.com/blog/1402876/201812/1402876-20181210165834870-1441419488.png)

（5）从queue中取出队列头的节点4，找出与节点4邻接的节点2,8，2属于已遍历点，排除；因此标记节点8为已遍历，然后放入queue中。

![](https://img2018.cnblogs.com/blog/1402876/201812/1402876-20181210165909853-2079926370.png)

（6）从queue中取出队列头的节点5，找出与节点5邻接的节点2,8，2,8均属于已遍历点，不作下一步操作。

![](https://img2018.cnblogs.com/blog/1402876/201812/1402876-20181210165934996-1890637570.png)

（7）从queue中取出队列头的节点6，找出与节点6邻接的节点3,8,9，3,8属于已遍历点，排除；因此标记节点9为已遍历，然后放入queue中。

![](https://img2018.cnblogs.com/blog/1402876/201812/1402876-20181210165955795-736888343.png)

（8）从queue中取出队列头的节点7，找出与节点7邻接的节点3, 9，3,9属于已遍历点，不作下一步操作。

![](https://img2018.cnblogs.com/blog/1402876/201812/1402876-20181210170014205-1659656728.png)

（9）从queue中取出队列头的节点8，找出与节点8邻接的节点4,5,6，4,5,6属于已遍历点，不作下一步操作。

![](https://img2018.cnblogs.com/blog/1402876/201812/1402876-20181210170031323-1591604088.png)

（10）从queue中取出队列头的节点9，找出与节点9邻接的节点6,7，6,7属于已遍历点，不作下一步操作。

![](https://img2018.cnblogs.com/blog/1402876/201812/1402876-20181210170050346-1329481029.png)

（11）queue 为空，则遍历结束

上面过程可以用下面的代码来表示：

[![复制代码](https://common.cnblogs.com/images/copycode.gif)](javascript:void(0); "复制代码")

```
    private Map<String, Boolean> status = new HashMap<String, Boolean>();
    private Queue<String> queue = new LinkedList<String>();
    public void BFSSearch(String startPoint) {
        //1.把起始点放入queue；
        queue.add(startPoint);
        status.put(startPoint, false);
        bfsLoop();
    }
  
    private void bfsLoop() {
        while(!queue.isEmpty()) {
            //  1) 从queue中取出队列头的点；更新状态为已经遍历。
            String currentQueueHeader = queue.poll(); //出队
            status.put(currentQueueHeader, true);
            System.out.println(currentQueueHeader);
            //  2) 找出与此点邻接的且尚未遍历的点，进行标记，然后全部放入queue中。
            List<String> neighborPoints = graph.get(currentQueueHeader);
            for (String poinit : neighborPoints) {
                if (!status.getOrDefault(poinit, false)) { //未被遍历
                    if (queue.contains(poinit)) continue;
                    queue.add(poinit);
                    status.put(poinit, false);
                }
            }
        }
    }
```

[![复制代码](https://common.cnblogs.com/images/copycode.gif)](javascript:void(0); "复制代码")

## 通用框架

其通用框架可以概括为：

[![复制代码](https://common.cnblogs.com/images/copycode.gif)](javascript:void(0); "复制代码")

```
void bfs(起始点) {
    将起始点放入队列中;
    标记起点访问;
    while (如果队列不为空) {  // 一般采用while ，当然也可以使用递归
        访问队列中队首元素x;
        删除队首元素;
        for (x 所有相邻点) {
            if (该点未被访问过且合法) {
                将该点加入队列末尾;
            　　if  (该结点是目标状态) {  // 达到目标，提前结束终止循环
                    置 flag= true;  
　　　　　　　　　　　　break; 
               }
            }
        }
    }
    队列为空，广搜结束;
}                      
```

[![复制代码](https://common.cnblogs.com/images/copycode.gif)](javascript:void(0); "复制代码")

下面来总结下写出 BFS 算法规则：

通过这个 bfs 框架可以看出该方法主要有以下几个规律：

1. ****起点条件。****从哪个点开始访问？是否每个点都需要当作起点？第一次 bfs 调用至关重要。
2. **邻接点。**如何去获取邻接点？通过起点可到达的点。如何保存邻接点？先进先出。一般采用队列。
3. **循环参数。**队列不为空。一个点的所有邻接点都是在一个 while 里面进行添加的，才会进入
4. ****访问标志。**** 为了避免重复访问，需要对已经访问过的节点加上标记，避免重复访问。

讲完了理论，下面开始进入实战。

## [200. 岛屿数量](https://leetcode-cn.com/problems/number-of-islands/)

给你一个由 '1'（陆地）和 '0'（水）组成的的二维网格，请你计算网格中岛屿的数量。

岛屿总是被水包围，并且每座岛屿只能由水平方向或竖直方向上相邻的陆地连接形成。

此外，你可以假设该网格的四条边均被水包围。

示例 1:

[![复制代码](https://common.cnblogs.com/images/copycode.gif)](javascript:void(0); "复制代码")

```
// 输入:
11110
11010
11000
00000
// 输出: 1
```

[![复制代码](https://common.cnblogs.com/images/copycode.gif)](javascript:void(0); "复制代码")

示例 2:

[![复制代码](https://common.cnblogs.com/images/copycode.gif)](javascript:void(0); "复制代码")

```
// 输入:
11000
11000
00100
00011
// 输出: 3
```

[![复制代码](https://common.cnblogs.com/images/copycode.gif)](javascript:void(0); "复制代码")

解释: 每座岛屿只能由水平和/或竖直方向上相邻的陆地连接而成。

---

题目解答如下：

[![复制代码](https://common.cnblogs.com/images/copycode.gif)](javascript:void(0); "复制代码")

```
class Solution {
    public int numIslands(char[][] grid) {
        if (grid == null || grid.length < 1 || grid[0].length<1) {
            return 0;
        }
        int num = 0;
        int nr = grid.length;
        int nc = grid[0].length;
　　　　　// 每个点都可能是起点
        for (int x =0;x<nr;x++) {
            for (int y =0;y<nc;y++) {
                if (grid[x][y]=='1') {
                    bfs(grid,x,y);
                    num++;
                }
            }
        }
        return num;
      
    }
　　 // 对于 bfs 来说，只要队列不为空，就可以一直走到头,
    private void bfs(char[][] grid, int r, int c) {
        int nr = grid.length;
        int nc = grid[0].length;
　　　　  // 队列，用于保存邻接点
        Queue<Integer> neighbors = new LinkedList<>();
　　　　　// 这里可以学下，对于二维可以将坐标转化为一个数字
        neighbors.add(r * nc + c); 
        while (!neighbors.isEmpty()) {
　　　　　　　// 每次循环开始的时候，需要移出一个点
            int id = neighbors.remove();
            int row = id / nc;
            int col = id % nc;
　　　　　　　// 四个邻接点都是在一个while循环里的
            if (row - 1 >= 0 && grid[row-1][col] == '1') {
                neighbors.add((row-1) * nc + col);
                grid[row-1][col] = '0';
            }
            if (row + 1 < nr && grid[row+1][col] == '1') {
                neighbors.add((row+1) * nc + col);
                grid[row+1][col] = '0';
            }
            if (col - 1 >= 0 && grid[row][col-1] == '1') {
                neighbors.add(row * nc + col-1);
                grid[row][col-1] = '0';
            }
            if (col + 1 < nc && grid[row][col+1] == '1') {
                neighbors.add(row * nc + col+1);
                grid[row][col+1] = '0';
            }
        }
    }
} 
```

[![复制代码](https://common.cnblogs.com/images/copycode.gif)](javascript:void(0); "复制代码")

## **[695. 岛屿的最大面积](https://leetcode-cn.com/problems/max-area-of-island/)**

给定一个包含了一些 0 和 1 的非空二维数组 grid 。

一个 岛屿 是由一些相邻的 1 (代表土地) 构成的组合，这里的「相邻」要求两个 1 必须在水平或者竖直方向上相邻。你可以假设 grid 的四个边缘都被 0（代表水）包围着。

找到给定的二维数组中最大的岛屿面积。(如果没有岛屿，则返回面积为 0 。)

**示例 1:**

[![复制代码](https://common.cnblogs.com/images/copycode.gif)](javascript:void(0); "复制代码")

```
[[0,0,1,0,0,0,0,1,0,0,0,0,0],
[0,0,0,0,0,0,0,1,1,1,0,0,0],
[0,1,1,0,1,0,0,0,0,0,0,0,0],
[0,1,0,0,1,1,0,0,1,0,1,0,0],
[0,1,0,0,1,1,0,0,1,1,1,0,0],
[0,0,0,0,0,0,0,0,0,0,1,0,0],
[0,0,0,0,0,0,0,1,1,1,0,0,0],
[0,0,0,0,0,0,0,1,1,0,0,0,0]]
```

[![复制代码](https://common.cnblogs.com/images/copycode.gif)](javascript:void(0); "复制代码")

对于上面这个给定矩阵应返回 6。注意答案不应该是 11 ，因为岛屿只能包含水平或垂直的四个方向的 1 。

**示例 2:**

```
[[0,0,0,0,0,0,0,0]]
```

对于上面这个给定的矩阵, 返回 0。

注意: 给定的矩阵grid 的长度和宽度都不超过 50。

---

这道题目和上面的很类似。题目解答如下：

[![复制代码](https://common.cnblogs.com/images/copycode.gif)](javascript:void(0); "复制代码")

```
class Solution {
    public int maxAreaOfIsland(int[][] grid) {
        if (grid == null || grid.length <1 || grid[0].length<1) {
            return 0;
        }
        int rx = grid.length;
        int cy = grid[0].length;
        int max = 0;
        for (int x =0; x< rx; x++) {
            for (int y= 0;y<cy; y++) {
                if (grid[x][y]==1) {
                    int num = bfs(grid,x,y);
                    max = Math.max(max, num);
                }
            }
        }
        return max;
    }

    private int  bfs (int[][] grid, int x, int y){
        int rx = grid.length;
        int cy = grid[0].length;
　　　　　// 每次调用就是一个面积
        int num = 1;
        grid[x][y] = 0;
        Queue<Integer> neQueue = new LinkedList<>();
　　　　　// 这里注意乘以的是col的长度
        neQueue.add(x*cy + y);
　　　　 // 队列不为空
        while(!neQueue.isEmpty()) {
            int point = neQueue.remove();
            int nx = point / cy;
            int ny = point % cy;
　　　　　　　// 每一个方向都要判断边界
            if (nx - 1 >= 0 && grid[nx-1][ny] == 1) {
                neQueue.add((nx-1) * cy + ny);
                grid[nx-1][ny] = 0;
                num++;
            }
            if (nx + 1 < rx && grid[nx+1][ny] == 1) {
                neQueue.add((nx+1) * cy + ny);
                grid[nx+1][ny] = 0;
                num++;
            }
            if (ny - 1 >= 0 && grid[nx][ny-1] == 1) {
                neQueue.add(nx * cy + ny-1);
                grid[nx][ny-1] = 0;
                num++;
            }
            if (ny + 1 < cy && grid[nx][ny+1] == 1) {
                neQueue.add(nx * cy + ny+1);
                grid[nx][ny+1] = 0;
                num++;
            }
        } 
        return num;
    }
}
```
