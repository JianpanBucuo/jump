 

var imgItem=[
"./img/bg/bg3.png",
"./img/score-bg.png",
"./img/sub-back.png",
"./img/background.jpg",
"./img/music-start.png",
"./img/music-stop.png",

"./img/phone/back.png",
"./img/phone/front.png",
"./img/phone/otherside.png",
"./img/box/0/block1top.png",
"./img/box/0/otherside1.png",
"./img/box/0/side1.png",
"./img/box/1/1-side.png",
"./img/box/1/1-side2.png",
"./img/box/1/1-top.png",
"./img/box/2/2-side.png",
"./img/box/2/2-side2.png",
"./img/box/2/2-top.png",
"./img/box/3/3-top.png",
"./img/box/3/3-side1.png",
"./img/box/3/3-side2.png",
 "./img/box/3/3-side1.png",
"./img/box/4/4-side1.png",
"./img/box/4/4-top.png",
"./img/box/5/5-side.png",
"./img/box/5/5-top.png",
"./img/box/6/store-left.png",
"./img/box/6/store-left2.png",
"./img/box/6/store-left3.png",
"./img/box/6/store_top.png",
"./img/box/7/honor-side.png",
"./img/box/7/honor-side1.png",
"./img/box/7/honor-top.png",
"./img/local/Dubai.png",
"./img/local/India.png",
"./img/local/London.png",
"./img/local/malaysia.png",
"./img/local/sa.png",
"./img/local/Paris.png",
"./img/local/SouthEast-Asia.png"


]
 
var count=0;
var len=imgItem.length;
$.each(imgItem,function(i,src){
    var imgItem=new Image();
   imgItem.src=src;
   imgItem.setAttribute('crossOrigin', 'Anonymous');
    $(imgItem).on("load error",function(){
     
     if(count>=len-1){ 
         $(".jump-shadow").hide(); 
     }
     count++;
    })
     
}) 





         
 