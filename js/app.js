// (function(){
 
//    var ua=navigator.userAgent.toLowerCase();
//    var t;
//    var config={
//    	     scheme_IOS:"weixin://scanqrcode",
//          //cundong://  orpheuswidget://
//    	     scheme_Adr:"weixin://scanqrcode",
//    	     //cundong://splash   orpheuswidget://
//    	     // download_url:document.getElementById("J-download-app").value,
//    	     download_url:"http://m.chanyouji.cn/apk/chanyouji-2.2.0.apk",
//    	     timeout:600

//    	        };

//            function openClient(){
//                    var startTime=Date.now(); 
//                    var ifr=document.createElement("iframe");
//                    ifr.src=ua.indexOf("os")>0 ? config.scheme_Adr :config.scheme_IOS;
//                    console.log(ifr.src);
//                    ifr.style.display="none";
//                    document.body.appendChild(ifr);
                 
//                   var t=setTimeout(function(){
//                   	var endTime=Date.now();
//                   	if(!startTime|| endTime-startTime<config.timeout+200){
//                   		window.location=config.download_url;
//                   		console.log(config.download_url);
//                   	}
//                   	else{

//                   	}
//                   },config.timeout);
//                   window.onblur=function(){
//                   	clearTimeout(t);
//                   }
        
         	
//          }
//  document.getElementById("J-call-app").addEventListener("click",openClient,false);
// })()
 

 // function openApp(schemaUrl, func) {
 //    var ifr = document.createElement('iframe'),
 //         t = 500,
 //          t1,
 //         timeout;

 //     ifr.style.display = 'none';
 //      document.body.appendChild(ifr);
 //     t1 = Date.now();
 //      ifr.src = schemaUrl;
 //      console.log(schemaUrl);
 //     timeout = setTimeout(function() {
 //         var t2 = Date.now();
 //        if (t2 - t1 < t + 1000) {
 //              if (typeof fail == 'function') {
 //                  fail();
 //              } else {
 //                  // location.href = fail;
 //                  alert("a");
 //              }
 //          }
 //         document.body.removeChild(ifr);
 //      }, t)
 // }

 // $("#J-call-app").on("click",function(){
 // 	 openApp("weixin://");
 // })
 $("#J-call-app").click(function(){  
 	// var ifr=document.createElement("iframe");
 	// ifr.src="twitter://";
 	// ifr.style.display="none";
 	// document.body.appendChild(ifr);
 	// setTimeout(function(){
 	// 	document.body.removeChild(ifr);
 	// },3000);
 	location.href="twitter://";
 	 // location.reload();
 console.log(location.href);
 })
  $("#J-face").click(function(){  
    
 	location.href="fb://";
 
 console.log(location.href);
 })