# cordova-plugin-baidu-push
百度云推送cordova插件

### 安装

安装插件：

```javascript
	cordova plugin add cordova-plugin-baidu-push
```

查看已安装插件：

```javascript
	cordova plugin ls
```

删除插件：
```javascript
	cordova plugin rm cordova-plugin-baidu-push
```

### 使用

##### 获取channelId

```javascript
	baidu_push.startWork(api_key, function(data){
	    console.log(data);
	});
```
	# api_key:百度云推送api_key
	# cb_success:调用成功回调方法，暂不考虑调用失败的回调，返回值结构如下：
	  #json: {
	    type: 'onbind', //对应Android Service的onBind方法
	    data: {
	      appId: 'xxxxxxxx',
	      userId: 'yyyyy',
	      channelId: 'zzzzzz'
	    }
	  }
	  
##### 取消绑定
baidu_push.stopWork

	baidu_push.stopWork(cb_success);
	# cb_success:调用成功能回调方法，返回值结构如下：
	  #json: {
	    type: 'onunbind', //对应Android Service的onUnbind方法
	    errorCode: 'xxxxxx', //对应百度的请求错误码
	    data: {
	      requestId: 'yyyyyy', //对应百度的请求ID
	    }
	  }

baidu_push.resumeWork

	baidu_push.resumeWork(cb_success);
	# cb_success:调用成功能回调方法，返回值结构如下：同baidu_push.startWork方法

baidu_push.setTags

	baidu_push.setTags(tags, cb_success);
	# tags: 想要设定的tag名,数组类型
	# cb_success:调用成功回调方法，暂不考虑调用失败的回调，返回值结构如下：
	  #json: {
	    type: 'onsettags', //对应Android Service的onSetTags方法
	    errorCode: 'xxxxxxxx',
	    data: {
	      requestId: 'yyyyy',
	      channelId: 'zzzzzz'
	      sucessTags: ['aaa', 'bbb', 'ccc'], //设置成功的tag列表
	      failTags: ['ddd', 'eee', 'fff'] //设置失败的tag列表
	    }
	  }

baidu_push.delTags

	baidu_push.delTags(tags, cb_success);
	# tags: 想要设定的tag名,数组类型
	# cb_success:调用成功回调方法，暂不考虑调用失败的回调，返回值结构如下：
	  #json: {
	    type: 'ondeltags', //对应Android Service的onDelTags方法
	    errorCode: 'xxxxxxxx',
	    data: {
	      requestId: 'yyyyy',
	      channelId: 'zzzzzz'
	      sucessTags: ['aaa', 'bbb', 'ccc'], //设置成功的tag列表
	      failTags: ['ddd', 'eee', 'fff'] //设置失败的tag列表
	    }
	  }

其他说明：

1. 关于回调方法的参数json的type可以返回以下值，分别对应Android的Service的百度云推送回调方法
onbind,onunbind,onsettags,ondeltags,onlisttags,onmessage,onnotificationclicked,onnotificationarrived

2. 由于百度应用区分android与ios，APP端可以使用以下方法区分判断：

### 判断platform

cordova.platformId

{"android" | "ios"}

### 更多信息

##### Android开发环境导入--Eclipse
导入路径：开发工程->platform->android

打开AndroidManifest.xml文件，找到【application】节点，追加以下属性

```xml
 android:name="com.baidu.frontia.FrontiaApplication"
```

##### IOS开发环境导入--Xcode
导入路径：开发工程->platform->ios

确认没有编译错误。