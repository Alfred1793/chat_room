var toName;
var username;
//点击好友名称展示相关消息
function showChat(name){
    toName = name;
    //现在聊天框
    $("#content").html("");
    $("#content").css("visibility","visible");
    $("#Inchat").html("<p style=\"text-align: center;font-weight: 400;\">与用户"+toName+"聊天</p>");
    //从sessionStorage中获取历史信息
    var chatData = sessionStorage.getItem(toName);
    if (chatData != null){
        //将内容渲染到聊天区
        $("#content").html(chatData);
    }
}
$(function () {
    $.ajax({
        url:"getUsername",
        success:function (res) {
            username = res;
        },
        async:false //同步请求，只有上面好了才会接着下面
    });
    //建立websocket连接
    //获取host解决后端获取httpsession的空指针异常
    var host = window.location.host;
    var ws = new WebSocket("ws://"+host+"/chat");
    ws.onopen = function (evt) {
        $("#username").html("<h3 style=\"text-align: center;\">用户："+ username +"<span>-在线</span></h3>");
    }
    //接受消息
    ws.onmessage = function (evt) {
        console.log("onmessage");
        //获取服务端推送的消息
        var dataStr = evt.data;
        //将dataStr转换为json对象
        var res = JSON.parse(dataStr);

        //判断是否是系统消息
        if(res.system){
            console.log("isSystem");
            //系统消息{"isSystem":true,"fromName":xxx,"message":["xxx","xxxx"]}
            //1.好友列表展示
            //2.系统广播的展示
            //此处声明的变量是调试时命名的，可以直接合并


            var names = res.message;
            var userlistStr = "";
            var broadcastListStr = "";
            for (var name of names){
                console.log(name);
                if (name != username){
                    temp = "<li className=\"rel-item\"><a onClick='showChat(\""+name+"\")'>"+name+"</a></li>"
                    userlistStr = userlistStr + temp;
                }
            }
            //渲染好友列表和系统广播
            $("#user-list").html(userlistStr);
            $("#xtList").scrollTop($("#xtList")[0].scrollHeight);

        }else {
            console.log("isnotSystem");
            //不是系统消息{"isSystem":false,"fromName":xxx,"message":"hello"}
            var str="<div class=\"item left\">" +
                "<img class=\"header-img\" src=\"images/head.png\" />\n" +
                "<span class=\"message\">"
                + res.message +
                "</span>" +
                "</div>"
            temp = "<li className=\"rel-item\"><a onClick='showChat(\""+res.fromName+"\")'>您收到一条来自"+res.fromName+"的消息</li>"
            if (toName === res.fromName) {
                $("#content").append(str);
                $("#content").scrollTop($("#content")[0].scrollHeight);
            }else{
                $("#broadcast").append(temp);
                $("#xtList").scrollTop($("#xtList")[0].scrollHeight);
            }
            var chatData = sessionStorage.getItem(res.fromName);
            if (chatData != null){
                str = chatData + str;
            }
            //保存聊天消息
            sessionStorage.setItem(res.fromName,str);
        };
    }
    ws.onclose = function () {
        $("#username").html("<h3 style=\"text-align: center;\">用户："+ username +"<span>-离线</span></h3>");
    }

    $(document).keydown(function(e){
        if(e.keyCode==13){
            $("#submit").click();
        }
    });

    //发送消息
    $("#submit").click(function () {
        //1.获取输入的内容
        var data = $("#input_text").val();
        //2.清空发送框
        $("#input_text").val("");
        var json = {"toName": toName ,"message": data};
        //将数据展示在聊天区
        var str = "<div class=\"item right\">" +
            "<img class=\"header-img\" src=\"images/head.png\" />" +
            "<span class=\"message\">" +
            data +
            "</span>" +
            "</div>";
        $("#content").append(str);
        $("#content").scrollTop($("#content")[0].scrollHeight);
        //可能之前已经有数据了所以得先获取
        var chatData = sessionStorage.getItem(toName);
        if (chatData != null){
            //追加
            str = chatData + str;
        }
        sessionStorage.setItem(toName,str);
        //3.发送数据
        ws.send(JSON.stringify(json));
    })
})