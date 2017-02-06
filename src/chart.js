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
 * 
 * 因为手指盲区，修改了了Tooltips位置
 */
"use strict";
const color = ["#07BEF5","#3FDD66","#12D4AE","#FEF114","#FFC000"];
let equipmentWidth,equipmentHeight;
let paddingTop = 0;//距离顶部高度，如有标题则增加30
function titleTextWidth (text,value = 1) {
    //用于算标题实际宽度的
    text = text.split('');
    let width = 0;

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
            console.log(1)
            width += (20*value);
        }
    });
    return width;
}

function drawDashedLine(context, x1, y1, x2, y2, dashLength = 4) {
    // 画虚线
    context.beginPath();
    context.setStrokeStyle("#dddddd");

    dashLength = dashLength === undefined ? 5 : dashLength;
    var deltaX = x2 - x1;
    var deltaY = y2 - y1;
    var numDashes = Math.floor(
        Math.sqrt(deltaX * deltaX + deltaY * deltaY) / dashLength);
        for (var i=0; i < numDashes; ++i) {
        context[ i % 2 === 0 ? 'moveTo' : 'lineTo' ]
        (x1 + (deltaX / numDashes) * i, y1 + (deltaY / numDashes) * i);
        }
    context.stroke();
 };

function buildPublic(context,params,width){
    let icon = true;
    if(params.icon){
        icon = params.icon
    }else{
        icon = params.icon
    }
    if(params.title){
        context.setFillStyle("#000000");
        context.setFontSize(20);
        let length = titleTextWidth(params.title,1);
        context.fillText(params.title,(width/2 - length / 2),30)
        paddingTop = 32;
    }
    if(params.subtitle){
        context.setFontSize(14);
        context.setFillStyle("#666666");
        let length = titleTextWidth(params.subtitle,14/20);
        context.fillText(params.subtitle,(width/2 - length / 2),53)
        paddingTop = 55;
    }
    if(params.icon){
        //有效范围300 start = width - 300 / 2
        let start = (width - 300)/2;
        let trlevel = 0;
        if(params.data[0].name===undefined||params.data[0].name===''){
            return context;
        }
        for(let i = 0;i<params.data.length;i++){
            let trlevel = parseInt(i/3);
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
    let params = data.params
    
    
    // var context = wx.createContext();//创建画布 v0.1.0
    

    let yAxisObj = {
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
    context.stroke();


    context.fillText(yAxisObj.max.toFixed(2),5,40 + paddingTop)


    context.fillText(yAxisObj.mid.toFixed(2),5,95 + paddingTop)


    context.fillText(yAxisObj.min.toFixed(2),5,150 + paddingTop)


    if(params.yAxis.subline){
        // 是否开启Y轴辅助线
        drawDashedLine(context, 30, 40 + paddingTop, width-15, 40 + paddingTop)
        drawDashedLine(context, 30, 95 + paddingTop, width-15, 95 + paddingTop)
        drawDashedLine(context, 30, 150 + paddingTop, width-15, 150 + paddingTop)
    }
    context.beginPath();
    context.setStrokeStyle("#cccccc");
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

    let xDistance = (width-75)/params.x.length
    let pointnum = parseInt(params.x.length/4)
    for(let i = 0;i<params.x.length;i++){
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
    for(let num = 0;num<params.data.length;num++){
        context.beginPath()
        context.setStrokeStyle(params.data[num].color);

        for(let i = 0;i<params.data[num].y.length;i++){
            let h = (params.data[num].y[i]-yAxisObj.min)/(yAxisObj.max-yAxisObj.min)
            if(i==0){
                
                context.moveTo(45, 150-h*height + paddingTop)
            }else{
                
                context.lineTo(45+i*xDistance, 150-h*height + paddingTop)
            }
        }
        context.stroke()
        if(params.point.enable){
            context.beginPath()
            for(let i = 0;i<params.data[num].y.length;i++){
                let h = (params.data[num].y[i]-yAxisObj.min)/(yAxisObj.max-yAxisObj.min)
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
        let Point = {
            x:0,
            index:0
            // y:0
        }
        // console.log(data.params.data[0].y)
        for(let i = 0;i<data.params.x.length;i++){
            if(Math.abs(xPoint - (45+i*xDistance))<(xDistance/2)){
                Point.x = 45+i*xDistance;
                Point.index = i;
                // Point.y = data.params.data[0].y[i]
                continue;
            }
        }
        return Point
    }
    /* 十字交叉线的横线 */
    function drawXLine(context,point){
        let h = (params.data[0].y[point.index]-yAxisObj.min)/(yAxisObj.max-yAxisObj.min)
        return 150-h*height
    }

    /* Tooltips try */
    function drawTooltips(context,point,data){
        //判断Tooltips居左还是居右
        let offsetX = -50;
        let offsetTrangle = 8;
        if(point.x>equipmentWidth*2/3){
            offsetX = -50;
            offsetTrangle = -8
        }
        let h = drawXLine(context,point);
        offsetTrangle = 0
        context.beginPath();
        context.setStrokeStyle('#cccccc')//为什么没生效？
        context.setFillStyle('white');
        
        // context.setShadow(2, 2, 2, '#000000');//画不了边框先用阴影代替
        // let h = (params.data[num].y[point.index]-yAxisObj.min)/(yAxisObj.max-yAxisObj.min)
        context.rect(point.x + offsetX + offsetTrangle,h,100,50)
        // context.rect(point.x,data.y,100,50)
        context.fill()
        context.stroke();
        context.setFillStyle('#000000');
        context.setShadow(0, 0, 0, '#000000')
        context.fillText('日期: ' + data.params.x[point.index],point.x+10+offsetX + offsetTrangle,h+ 15);
        
        let unit = data.params.data[0].unit!==undefined?data.params.data[0].unit:''
        context.fillText(unit+':',point.x + 10 + offsetX + offsetTrangle,h+ 30);
        console.log(1)
        
        for(let i = 0;i<params.data.length;i++){
            context.setFillStyle(params.data[i].color);
            context.setShadow(0, 0, 0, '#000000')
            
            context.fillText(data.params.data[i].y[point.index].toFixed(4),point.x + 10 + titleTextWidth(unit,13/20) + offsetTrangle + offsetX,h+ 30 + 15*i);
          
        }
    }
    
    if(data.x!=0&&data.x>=45&&data.x<=(width-45)&&data.y>15 + paddingTop&&data.y<150 + paddingTop){
        context.beginPath() ;
        context.setStrokeStyle('#d1d1d1');
        let Point = drawAmendment(data.x)
        context.moveTo(Point.x, 170 + paddingTop);
        context.lineTo(Point.x, 15 + paddingTop)
        context.stroke();
        // drawXLine(context,Point);
        drawTooltips(context,Point,data);
    }

    
    context.draw();
}
function calculateAngle(start,end,range,list){
    //计算角度
    //start 为原点
    
    let x = Math.abs(start.x-end.x);
    let y = Math.abs(start.y-end.y);
    let z = Math.sqrt(x*x+y*y);
    if(z<=range&&z>=(range-30)*4/5){
        console.log(list)
    let rotat = Math.round((Math.asin(y/z)/Math.PI*180)); //得到的角度
        if (end.x >= start.x && end.y <= start.y) {
            rotat = rotat;
        }
    // 第二象限
        else if (end.x <= start.x && end.y <= start.y) {
            rotat = 180 - rotat;
        }
    // 第三象限
        else if (end.x <= start.x && end.y >= start.y) {
            rotat = 180 + rotat;
        }
    // 第四象限
        else if(end.x >= start.x && end.y >= start.y){
            rotat = 360 - rotat;
        }
        rotat; //真实的角度
        if(rotat>list.start&&(rotat<list.start+list.range)){
            return rotat
        }else{
            return false;
        }
    }else{
        return false;
    }
    
}

function Pie(context,data){
    //圆心
    console.log(data)
    let params = data.params
    let width = equipmentWidth;
    // buildPublic(context,params,width);
    if(data.width!=undefined){
        width = data.width
    }
    

    const centerX = width/2; 
    const centerY = width/2; 
    context.setLineWidth(1)
    let pie = params.data;
    let sum = 0;
    
    for(let i = 0;i<pie.length;i++){
        sum = sum + pie[i];
    }
    let list = []
    let rangeStart = 0
    for(let i = 0;i<pie.length;i++){
        list.push({
            start:rangeStart,
            range:(pie[i]/sum*360)
        })
        rangeStart += (pie[i]/sum*360) 
    }
    
    let rotate = 0;
    for(let i = 0;i<pie.length;i++){
        context.beginPath()
        if(i==0){
            context.setStrokeStyle("#F2264A")
            context.setFillStyle("#F2264A")
        }else{
            context.setStrokeStyle(color[i%5])
            context.setFillStyle(color[i%5])
        }
        context.moveTo(centerX, centerY);
        if(calculateAngle({x:centerX,y:centerY},data,centerX,list[i])){
            // calculateAngle假如选中会返回一个度数，然后增加圆环的宽度。
            context.arc(centerX, centerY, centerX-10, 0+rotate,rotate - (2 * Math.PI)*(pie[i]/sum), true);
        }else{
            context.arc(centerX, centerY, centerX-20, 0+rotate,rotate - (2 * Math.PI)*(pie[i]/sum), true);
        }
        
       
        rotate = rotate - (2 * Math.PI)*(pie[i]/sum)
        context.lineTo(centerX, centerY);
        context.fill()
    }
    context.beginPath()
    context.setFillStyle("#ffffff")
    context.setStrokeStyle("#ffffff")
    context.arc(centerX, centerY, (centerX-30)*4/5, 0,(2 * Math.PI), true);
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