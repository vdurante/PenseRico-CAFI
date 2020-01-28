// ==UserScript==
// @name         Contador CAFI - Carteira de Análise Fundamentalista de Investimentos / Pense Rico
// @namespace    http://tampermonkey.net/
// @version      0.4
// @author       Vitor Subs
// @description  Utilizado para calcular o número de votos da CAFI no portal Pense Rico
// @match        https://forum.penserico.com/t/cafi-carteira-de-analise-fundamentalista-de-investimentos/*
// @grant        none
// ==/UserScript==

var globalVotes = {};

function buildInterface() {
  $("body").append(`
<div style="position:fixed; right:0; bottom:0; z-index: 999;">
<button id="setup" style="font-size: 40px;"> Iniciar </button>
<button id="run" style="font-size: 40px;" disabled> Calcular </button>
<textarea id="result" style="height=500px"/>
</div>`);
}
function loadAllPosts(previousDocumentHeight, callback) {
  var documentHeight = $(document).height();
  if (previousDocumentHeight == documentHeight) {
    callback();
  } else {
    $("html, body").animate({ scrollTop: documentHeight - 750 }, 10000, null);
    setTimeout(function() {
      loadAllPosts(documentHeight, callback);
    }, 15000);
  }
}
function runPost(post, callback) {
  //post.find('.cooked').children().not('p, ul').remove();
  post
    .find(".cooked")
    .find(":not(p, ul, br, li, ol)")
    .remove();
  var text = post.find(".cooked")[0].innerHTML;
  var votes = text.match(/(\w{3,4}\d{1,2})/gi);
  if (votes && votes.length) {
    debugger;
    votes = votes.map(function(vote) {
      return vote.toUpperCase();
    });
    votes = [...new Set(votes)];
    if (votes.length > 10) {
      votes = votes.slice(0, 8);
    }
    for (let i = 0; i < votes.length; i++) {
      let vote = votes[i];
      if (!globalVotes[vote]) {
        globalVotes[vote] = 0;
      }
      globalVotes[vote] += 1;
    }
  }

  post.find(".cooked")[0].innerHTML = text.replace(
    /(\w{3,4}\d{1,2})/gi,
    "<span style='color: green; font-size: 20px;'>$1</span>"
  );
  $("html, body").animate({ scrollTop: post.offset().top - 75 }, 1000, null);
  var nextPost = post.nextAll().first();
  if (nextPost.length) {
    setTimeout(function() {
      runPost(nextPost, callback);
    }, 2000);
  } else {
    callback();
  }
}
function buildEvents() {
  $("#setup").click(function() {
    $(".topic-post").each(function(key, value) {
      if (!$(value).find(".cafi-checkbox").length) {
        $(value)
          .find(".topic-meta-data")
          .first()
          .prepend('<input class="cafi-checkbox" type="checkbox"/>');
      }
    });
    $(".cafi-checkbox").change(function() {
      $("#run").prop("disabled", false);
    });
  });

  $("#run").click(function() {
    let selected = $(".cafi-checkbox:checked")
      .first()
      .parents(".topic-post")
      .first();
    runPost(selected, () => {
      console.log(globalVotes);
      result = "";
      for (let vote in globalVotes) {
        result += vote + "\t" + globalVotes[vote] + "\n";
      }
      $("#result").val(result);
    });
  });
}
(function() {
  "use strict";

  setTimeout(function() {
    buildInterface();
    buildEvents();
  }, 5000);

  // Your code here...
  //     console.log($('.topic-post'));
})();
