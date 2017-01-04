/**
 * Created by yez on 2016/10/26.
 * TX 0.11更新 createCanvasContext 替换 createContext
 * 废弃drawCanvas 改用 draw 即可
 * 添加单位，添加标题，添加副标题
 * 添加自适应
 * 
 * 2016年12月30日
 * 添加横向和纵向辅助线
 * 
 * 2017年01月03日
 * 添加Tooltips
 */
"use strict";
var color = ["#07BEF5","#3FDD66","#12D4AE","#FEF114","#FFC000"];
var equipmentWidth,equipmentHeight;
var paddingTop = 0;//距离顶部高度，如有标题则增加30
function titleTextWidth (text,value) {
    //用于算标题实际宽度的
    var text = text.split('');
    var width = 0;
    text.forEach(function(item) {
        if (/[a-zA-Z]/.test(item)) {
            width += (14*value);
        } else if (/[0-9]/.test(item)) {
            width += (11*value);
        } else if (/\./.test(item)) {
            width += (5.4*value);
        } else if (/-/.test(item)) {
            width += (6.5*value);
        } else if (/[\u4e00-\u9fa5]/.test(item)) {
            width += (20*value);
        }
    });
    return width;
}

function buildPublic(context,params,width){
    var icon = true;
    if(params.icon){
        icon = params.icon
    }else{
        icon = params.icon
    }
    if(params.title){
        context.setFillStyle("#000000");
        context.setFontSize(20);
        var length = titleTextWidth(params.title,1);
        context.fillText(params.title,(width/2 - length / 2),30)
        paddingTop = 32;
    }
    if(params.subtitle){
        context.setFontSize(14);
        context.setFillStyle("#666666");
        var length = titleTextWidth(params.subtitle,14/20);
        context.fillText(params.subtitle,(width/2 - length / 2),53)
        paddingTop = 55;
    }
    if(params.icon){
        //有效范围300 start = width - 300 / 2
        var start = (width - 300)/2;
        var trlevel = 0;
        for(var i = 0;i<params.data.length;i++){
            var trlevel = parseInt(i/3);
            context.setFillStyle(params.data[i].color);
            context.fillRect(start + i * 100, 250 + trlevel * 15, 10, 5);
            context.setFillStyle('#000000');
            context.setFontSize(10);
            context.fillText(params.data[i].name,start + i * 100 + 15,256 + trlevel * 15);
        }
    }
    return context
}



function Line(context,data){
    const height = 110;//刻度线有效范围
    const width = equipmentWidth;
    var params = data.params
    
    
    // var context = wx.createContext();//创建画布 v0.1.0
    

    var yAxisObj = {
        //Y轴坐标点
        max: Math.max.apply(Math, params.data[0].y),
        mid: (Math.max.apply(Math, params.data[0].y)+Math.min.apply(Math, params.data[0].y))/2,
        min: Math.min.apply(Math, params.data[0].y)
    }

    context.beginPath();
    context.setStrokeStyle("#cccccc");
    context.setMiterLimit(1);
    context.setFillStyle("#666666");

    buildPublic(context,params,width);
    context.setFontSize(12);
    context.setFillStyle("#6F666A");

    // y 轴
    context.moveTo(30, 170 + paddingTop)
    context.lineTo(30, 15 + paddingTop)
    context.lineTo(27.5,20 + paddingTop)
    context.moveTo(30, 15 + paddingTop)
    context.lineTo(32.5,20 + paddingTop)
    context.fillText(yAxisObj.max.toFixed(2),5,40 + paddingTop)
    context.fillText(yAxisObj.mid.toFixed(2),5,95 + paddingTop)
    context.fillText(yAxisObj.min.toFixed(2),5,150 + paddingTop)

    // y轴单位
    if(params.yAxis.enable){
        if(params.yAxis.unit){
            context.fillText(params.yAxis.unit,2,10 + paddingTop)
        }else{
            context.fillText('value',2,10 + paddingTop)
        }   
    }
    


    // x 轴
    context.moveTo(30, 170 + paddingTop)
    context.lineTo(width-15, 170 + paddingTop)
    context.lineTo(width-20,167.5 + paddingTop)
    context.moveTo(width-15, 170 + paddingTop)
    context.lineTo(width-20,172.5 + paddingTop)
    // console.log(params)

    var xDistance = (width-75)/params.x.length
    var pointnum = parseInt(params.x.length/4)
    for(var i = 0;i<params.x.length;i++){
        if(i%pointnum==0){
            context.fillText(params.x[i],45+i*xDistance,185 + paddingTop)
        }
    }
    // x轴单位
    
    if(params.xAxis.enable){
        if(params.xAxis.unit){
            context.fillText(params.xAxis.unit,width-30,200 + paddingTop)
        }
    }

    context.stroke()

    // 划线
    for(var num = 0;num<params.data.length;num++){
        context.beginPath()
        context.setStrokeStyle(params.data[num].color);

        for(var i = 0;i<params.data[num].y.length;i++){
            var h = (params.data[num].y[i]-yAxisObj.min)/(yAxisObj.max-yAxisObj.min)
            if(i==0){
                
                context.moveTo(45, 150-h*height + paddingTop)
            }else{
                
                context.lineTo(45+i*xDistance, 150-h*height + paddingTop)
            }
        }
        context.stroke()
        if(params.point.enable){
            context.beginPath()
            for(var i = 0;i<params.data[num].y.length;i++){
                var h = (params.data[num].y[i]-yAxisObj.min)/(yAxisObj.max-yAxisObj.min)
                if(i==0){
                    context.arc(45, 150-h*height+paddingTop,1,0,2*Math.PI)
                }else{
                    context.arc(45+i*xDistance, 150-h*height + paddingTop,1,0,2*Math.PI)
                }
            }

            context.stroke()
        }
        
    }

    /* 触摸的时候十字交叉线的竖线
    *
    *
    */
    function drawAmendment(xPoint){
        var Point = {
            x:0,
            index:0
        }
        for(var i = 0;i<data.params.x.length;i++){
            if(Math.abs(xPoint - (45+i*xDistance))<(xDistance/2)){
                Point.x = 45+i*xDistance;
                Point.index = i;
                continue;
            }
        }
        return Point
    }
    /* 十字交叉线的横线 */
    function drawXLine(context,point){
        for(var num = 0;num<params.data.length;num++){
            context.beginPath() ;
            var h = (params.data[num].y[point.index]-yAxisObj.min)/(yAxisObj.max-yAxisObj.min)
            context.moveTo(30, 150-h*height + paddingTop);
            context.lineTo(width-15, 150-h*height + paddingTop);
            context.stroke();
        }
    }

    /* Tooltips try */
    function drawTooltips(context,point,data){
        //判断Tooltips居左还是居右
        var offsetX = 0;
        var offsetTrangle = 8;
        if(point.x>equipmentWidth*2/3){
            offsetX = -100;
            offsetTrangle = -8
        }
        

        context.setStrokeStyle('#cccccc')//为什么没生效？
        context.setFillStyle('white');
        
        // context.setShadow(2, 2, 2, '#000000');//画不了边框先用阴影代替
        context.rect(point.x + offsetX + offsetTrangle,data.y,100,50)
        context.fill()
        context.stroke();

        context.setFillStyle('#000000');
        context.setShadow(0, 0, 0, '#000000')
        context.fillText('日期: ' + data.params.x[point.index],point.x+10+offsetX + offsetTrangle,data.y+ 15);
        context.fillText('净值:',point.x+10+offsetX + offsetTrangle,data.y+ 30);
        for(var i = 0;i<params.data.length;i++){
            context.setFillStyle(params.data[i].color);
            context.setShadow(0, 0, 0, '#000000')
            
            context.fillText(data.params.data[i].y[point.index].toFixed(4),point.x + 10 + 32 + offsetTrangle + offsetX,data.y+ 30 + 15*i);
        }

        context.beginPath()
        context.setFillStyle('white');
        context.setStrokeStyle('#ffffff')
        context.moveTo(point.x,data.y+10);        
        context.lineTo(point.x + offsetTrangle,data.y+18);
        context.lineTo(point.x + offsetTrangle,data.y+2);
        context.lineTo(point.x,data.y+10);
        context.fill()
        context.stroke();

        context.beginPath()
        context.setStrokeStyle('#cccccc')
        context.moveTo(point.x,data.y+10);        
        context.lineTo(point.x + offsetTrangle,data.y+18);
        context.stroke();
        context.beginPath()
        context.moveTo(point.x,data.y+10);    
        context.lineTo(point.x + offsetTrangle,data.y+2);
        context.stroke();
    }
    
    if(data.x!=0&&data.x>=45&&data.x<=(width-45)&&data.y>15 + paddingTop&&data.y<150 + paddingTop){
        context.beginPath() ;
        context.setStrokeStyle('#d1d1d1');
        var Point = drawAmendment(data.x)
        context.moveTo(Point.x, 170 + paddingTop);
        context.lineTo(Point.x, 15 + paddingTop)
        context.stroke();
        // drawXLine(context,Point);
        drawTooltips(context,Point,data);
    }

    
    context.draw();
}
function Pie(context,params){
    // var context = wx.createContext();//创建画布
    // var context = wx.createCanvasContext(params.id);
    //圆心
    const centerX=375/2; 
    const centerY=375/2; 
    context.setLineWidth(1)
    
    var pie = params.data;
    var sum = 0;
    context.setFillStyle(color[i%5])
    for(var i = 0;i<pie.length;i++){
        sum = sum + pie[i];
    }
    var rotate = 0;
    for(var i = 0;i<pie.length;i++){
        context.beginPath()
        if(i==0){
            context.setStrokeStyle("#F2264A")
            context.setFillStyle("#F2264A")
        }else{
            context.setStrokeStyle(color[i%5])
            context.setFillStyle(color[i%5])
        }
        context.moveTo(centerX, centerY);
        context.arc(centerX, centerY, 100, 3*Math.PI/2+rotate,(2 * Math.PI)*(pie[i]/sum), false);
        rotate = rotate + (2 * Math.PI)*(pie[i]/sum)
        context.lineTo(centerX, centerY);
        context.fill()
    }

    context.beginPath()
    context.setFillStyle("#ffffff")
    context.setStrokeStyle("#ffffff")
    context.arc(375/2, 375/2, 80, 0,(2 * Math.PI), false);
    context.fill()

    context.stroke()

    context.draw();
}
function charts(data){
    wx.getSystemInfo({
        success: function(res){
            equipmentWidth = (res.windowWidth);
            equipmentHeight = (res.windowHeight);
            var context = wx.createCanvasContext(data.params.id);//创建画布
            if(data.params.type === 'Line'){
                Line(context,data)
            }
            if(data.params.type === 'Pie'){
                Pie(context,data)
            }
            
        },
        fail: function(res){
            console.log("无法获取手机信息")
        },
    })
}
module.exports = {
    charts: charts
};