   $(".rank").on("click",function(){
    $(".content").show();
    $(".rank-page").show();
    $(".mask-show").addClass("mask-show-bac");
    $(".mask").addClass("mask-show");
    $.ajax({
        type:"get", 
        dataType:"json",
        url:'https://www.hihonor.com/abroad/jumpScore/listScoreInfo',
        success:function(data){

              var a=JSON.parse(data);
                    console.log(a); $('.rank-data tbody').empty();
                    $.each(a.jumpScoreInfoBean,function(a,b){
                      
                      $('.rank-data tbody').append("<tr><td>"+b.orderNum+"</td><td>"+b.score+"</td><td>"+b.nickName+"</td></tr>");
                        
                    })
        },
        error:function (data) {
           console.log(data);
        }
    })
   })
var lv,imageurl,score;
$(".submit-go").click(function(){
	var name=$(".name").val();
	var email=$(".email").val(); 
	score=$(".score").text();

  if(score<=99){
    lv="Rookie";
    imageurl="https://www.hihonor.com/global/wp-content/uploads/2018/04/game05.jpg";
  }else if(score<=299){
    lv="Rising Star"
    imageurl="https://www.hihonor.com/global/wp-content/uploads/2018/04/game04.jpg";
  }else if(score<=499){
    lv="Adventurer"
    imageurl="https://www.hihonor.com/global/wp-content/uploads/2018/04/game03.jpg";
  }else if(score<=515){
    lv="Game Master"
    imageurl="https://www.hihonor.com/global/wp-content/uploads/2018/04/game02.jpg";
  }else if(score>515){
    lv="Grand Champion"
    imageurl="https://www.hihonor.com/global/wp-content/uploads/2018/04/game01.jpg";
  }else{
    lv="Rookie";
    imageurl="https://www.hihonor.com/global/wp-content/uploads/2018/04/game05.jpg";
  }
	 var titleTxt='Aurora Tour With #Honor10',
     contentTxt='I just got '+score+'! I am a '+lv+' now. Come play & win prizes! ',
      eventSrc='https://www.hihonor.com/global/aurora-tour/index.html';

   $.ajax({
          type:"post",
          dataType:"json",
          url: 'https://www.hihonor.com/abroad/jumpScore/submitScoreInfo',
          data:{
          	email:email,
          	nickName:name, 
          	score:score,
          	title:titleTxt,
          	content: contentTxt,
            globalAddr: eventSrc,
            imgurl: imageurl,
            country: "global",
          },
          success:function(data){
          console.log(data.jumpScoreInfoBean[0].orderNum);
                    var num=data.jumpScoreInfoBean[0].orderNum;
                    var url=data.jumpScoreInfoBean[0].htmlPath;
                     $(".num").text(num);
                    link=url;
                 $(".sub-des").html("")
    		         $(".post-info").hide();
                 $(".submit-after-all").show();
                 $(".sub-name").html(name);
                  $(".s7").hide();
                  $(".sub-des").hide();
                $(".rank-deliver").hide();
                $(".rank-deliver-after").show(); 
                $(".offers").show(); 
 
                },
                error:function(data){
                   $("p.warning").remove();
                   $("p.correct").remove();$("p.sub-again").remove();
                  $("<p class='sub-again'>Please submit again</p>").insertBefore($(".post-info .close"));
                }
   })
})
         //分享到twitter
        // $('.submit-after-all').on("click",".share-tw",function(){
        //     window.open('https://twitter.com/intent/tweet?status='+encodeURIComponent('I just got '+score+' in the Aurora Tour With #Honor10! I am a '+lv+' now! Come play & win prizes!')+' '+encodeURIComponent(link),'_blank','toolbar=yes, location=yes, directories=no, status=no, menubar=yes, scrollbars=yes, resizable=no, copyhistory=yes, width=600, height=450,top=100,left=350');
        // });
        window.fbAsyncInit = function(){FB.init({appId: '672360942936187',autoLogAppEvents:true,xfbml: true,version:'v2.12'});};
        (function(d, s, id){var js, fjs = d.getElementsByTagName(s)[0];if (d.getElementById(id)) {return;}js = d.createElement(s); js.id = id;js.src = "https://connect.facebook.net/en_US/sdk.js";fjs.parentNode.insertBefore(js, fjs);}(document, 'script', 'facebook-jssdk'));
       


        //分享到facebook
        $('.submit-after-all').on("click",".share-fb",function(){
            FB.ui({method: 'share',display: 'popup',hashtag: '‪#Honor10',href: link,}, function(response){});
        });

