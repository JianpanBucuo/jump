 var ifMusicPlay=false;

 var emailCheck=false;
 var tcCheck=false;
document.oncontextmenu = function() {
	return false;
}
// window.ontouchstart = function(e) { e.preventDefault(); };
var game = new Game()
game.init()
game.addSuccessFn(success)
game.addFailedFn(failed)

var mask = document.querySelector('.mask');
mask.style.display="none";
var restartButton = document.querySelector('.restart')
var score = document.querySelector('.score')

restartButton.addEventListener('click', restart)
$(".restart").on("click", function() {
	$(".rank-page").hide();
	$(".post-info").hide();
	 $(".s7").show();
     $(".post-info .submit-after-show").hide();
     $(".post-info .form").show();
     $(".submit-after-all").hide();
     $(".name").val("");
     $(".email").val(""); 
     $(".agree").removeAttr("checked");
     $(".offers").hide();
     $("button.submit").get(0).disabled="disabled";
})
// 
// 游戏重新开始，执行函数
function restart() {
	mask.style.display = 'none'
	game.restart()
	game.jumperStat.xSpeed =0;
	game.jumperStat.ySpeed=0;
	ready: false;
}
// 游戏失败执行函数
var xx=null;
function failed() {
	// alert("a");
	score.innerText = game.score;

	// mask.style.display = 'flex'
	$(".mask2").show();
	$(".local-info").fadeIn(); 
 $(".local-info .local-info-content").html("Oops! Don't worry. Honor phones never break. Play again! Get first-hand info and win more prizes at the 5/15 live stream on hihonor.com! ");
  $(".twitter").empty();
  var txt="";
  if(game.score>=0&&game.score<=99){txt="Rookie";}
  else if(game.score>=00&&game.score<=299){ txt="Rising Star";}
  else if(game.score>=300&&game.score<=499){txt=" Adventurer";}
  else if(game.score>=500&&game.score<=515){txt="Jump Master";}
  else{ txt= "Grand Champion";}
   

  $(".twitter").html('<a  href="https://twitter.com/intent/tweet?button_hashtag=I just got '+game.score+'! I am a '+txt+' now. Come play & win prizes! &amp;text=I just got '+game.score+'! I am a '+txt+' now. Come play & win prizes!  &amp;text=I just got '+game.score+'! I am a '+txt+' now. Come play & win prizes! &amp;url=https://www.hihonor.com/global/aurora-tour/index.html" data-url="https://www.hihonor.com/global/aurora-tour/index.html" data-lang="en" data-related="Welcome to the Aurora Tour with Honor 10" data-hashtags="I just got '+game.score+'! I am a '+txt+' now. Come play & win prizes! &amp;text=I just got '+game.score+'! I am a '+txt+' now. Come play & win prizes! " class="twitter-share-popups twtr-icon" title="Twitter" target="_blank"> <img src="./img/icon-twitter.png"></a>')

 


  xx=setTimeout(function(){ 
   	if(mask.style.display=="none"){
   	 mask.style.display = 'block'; 
   	}
   	 
   	},2000);
}
$(".mask2").on("click",function(){
	mask.style.display = 'block'
     clearTimeout(xx); 	
     xx=null;
})
// 游戏成功，更新分数
function success(score) {
	var scoreCurrent = document.querySelector('.score-current')
	scoreCurrent.innerText = score
}

$(function() {
	// $(".rank").on("click touchstart", function() {
	//     $(".mask-show").addClass("mask-show-bac");
	//     $(".rank-page").show();
	// })
	$(".rank-page .close").on("click touchstart", function() {
		$(".content").show();
		$(".rank-page").hide();
		 
         // $(".mask-show").removeClass("mask-show-bac");

	})
	$(".content .submit").on("click touchstart", function() {
		 // $(".mask-show").addClass("mask-show-bac");
		$(".restart").attr('disabled', true);
           $(".name").focus();
		$(".post-info").show();
	})
	$(".post-info .close").on("click touchstart", function() {
		$(".content").show();
		$(".post-info").hide();
		$(".restart").attr('disabled', false);
	 
		$(".rank-page").hide();
		// $(".mask-show").removeClass("mask-show-bac");

	})
	$(".play .play-button").on("click touchstart", function() {
		$(".play").fadeOut();
		 
	});
});
 
var mouseEvents = (game.config.isMobile) ? {
	down: 'touchstart',
	up: 'touchend',
} : {
	down: 'mousedown',
	up: 'mouseup',
};
// 事件绑定到canvas中
var info = document.querySelector('.local-info')
info.addEventListener(mouseEvents.down, function() {
	game._handleMousedown();
	game._musicPower();
})
// 监听鼠标松开的事件
info.addEventListener(mouseEvents.up, function(evt) {
	game._handleMouseup()
})


var startButton=document.querySelector(".play-button");
startButton.addEventListener("click",function(){

	game.music.fall_failed[0].play();
	game.music.fall_failed[0].volumn=0;
	game.music.fall_failed[0].pause();
	 
	game.music.fall_success_normal[0].play();
	game.music.fall_success_normal[0].volumn=0;
	game.music.fall_success_normal[0].pause();

});

$(".email,.name").on("blur",check);
function check(){
 var reg = new RegExp("^[a-z0-9]+([._\\-]*[a-z0-9])*@([a-z0-9]+[-a-z0-9]*[a-z0-9]+.){1,63}[a-z0-9]+$"); 
   var x=$(".email").val();
    $("p.warning").remove();
  	  $("p.correct").remove();
  if(x==""){   
  	    emailCheck=false;
        $("<p class='warning'>Please enter your email</p>").insertBefore($(".agree")); 
  }
  else if(reg.test(x)==false){
  	  emailCheck=false;
     $("<p class='warning'>Please enter the correct email</p>").insertBefore($(".agree"));
  }
  else{
  	   emailCheck=true;
  	$("<p class='correct'>Please submit</p>").insertBefore($(".agree"));
  }
checkSubmit();

}
function checkSubmit(){
	  $("p.sub-again").remove();
	 if(tcCheck==true&&emailCheck==true&&$(".name").val()!==""){
	 	 $("button.submit").get(0).removeAttribute("disabled");
	 	}else{
	 		$("button.submit").get(0).disabled="disabled";
	 	}
}
$(".agree").on("click",function(){
	 if($(this).get(0).checked==true ){ 	 
	 	   tcCheck=true;
	 }else{
	    tcCheck=false;	  
	 }
	 checkSubmit();
}) 
// game.music.power_increase[0].volumn=1;
// 	 	     game.music.fall_failed[0].volumn=1;
// 	 	     game.music.fall_success_normal[0].volumn=1;
$(".music-bac").on("click",function(){
	var music1=game.music.background[0]; 
        music1.loop="loop";
       
	 if(music1.paused) 
	 	 {music1.play();
				 $(this).addClass("start");
		        $(this).removeClass("stop");
	 	     ifMusicPlay=true;
	 	console.log(1); 
	     }
	 else{
	 	ifMusicPlay=false;
	 	music1.pause();console.log(2);
	  
	 	$(this).addClass("stop");
	 	$(this).removeClass("start");
	 }
}) 


  $(".label a").on("click",function(){
  		$(".TC-content").show();$(".mask-show").addClass("mask-show-bac");
  })



   $(".TC").on("click",function(){
   	$(".TC-content").show();
   });
 $(".ex-of").on("click",function(){
 	 $(".Con-content").show(); $(".play-mask").addClass("play-mask-show");
 })

   $(".mask .TC").on("click",function(){
   	 $(".mask-show").addClass("mask-show-bac");
   })
  $(".TC-content .close").on("click",function(){
       $(".TC-content").hide();
       // $(".mask-show").removeClass("mask-show-bac");
  })
  $(".play .TC").on("click",function(){
  	 $(".play-mask").addClass("play-mask-show");
  })
  $(".close").on("click",function(){
  	 $(".play-mask").removeClass("play-mask-show");
  })
  $(".offers").on("click",function(){ 
  	 $(".Con-content").show();
  	 $(".mask-show").addClass("mask-show-bac");
  });
  $(".Con-content .close").on("click",function(){
       // $(".mask-show").removeClass("mask-show-bac");
        $(".Con-content").hide();
  })