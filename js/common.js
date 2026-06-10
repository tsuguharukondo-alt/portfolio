// ================================================
// ページトップから開始（index.htmlのみ）
// ================================================
if (document.getElementById('loadingScreen')) {
  if ('scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
  }
  window.scrollTo(0, 0);
}


// ================================================
// ローディング → ロゴ動画 → メインページ（index.htmlのみ）
// ================================================
(function () {
  const loadingScreen  = document.getElementById('loadingScreen');
  if (!loadingScreen) return; // index.html以外では何もしない

  const percentText    = loadingScreen.querySelector('.loadingScreen_percent');
  const logoIntro      = document.getElementById('logoIntro');
  const logoIntroVideo = document.getElementById('logoIntroVideo');

  let currentPercent = 0;
  let targetPercent  = 0;
  let videoReady     = false;
  let countDone      = false;

  // --- 動画の読み込み準備完了を検知 ---
  logoIntroVideo.addEventListener('canplaythrough', function () {
    videoReady = true;
    targetPercent = 100;
    tryStartIntro();
  });

  // 読み込みが遅い場合でも最低限カウントを進める
  logoIntroVideo.load();

  // --- 0〜100% カウントアップアニメーション ---
  function animateCount() {
    const interval = setInterval(function () {
      if (currentPercent < targetPercent) {
        // targetに向かって加速しながら近づく
        const step = Math.max(1, Math.ceil((targetPercent - currentPercent) / 8));
        currentPercent = Math.min(currentPercent + step, targetPercent);
        percentText.textContent = currentPercent + '%';
      }
      if (currentPercent >= 100) {
        clearInterval(interval);
        countDone = true;
        tryStartIntro();
      }
    }, 30);
  }

  // --- 動画もカウントも揃ったら再生開始 ---
  function tryStartIntro() {
    if (!videoReady || !countDone) return;

    // ローディング画面をフェードアウト → 裏で動画が現れる
    loadingScreen.classList.add('hidden');
    logoIntroVideo.play();

    // 動画終了後にフェードアウト → メインページへ
    logoIntroVideo.addEventListener('ended', function () {
      logoIntro.classList.add('fadeout');
      setTimeout(function () {
        logoIntro.remove();
        loadingScreen.remove();
      }, 700);
    });
  }

  // カウントアップ開始（動画の読み込みと並走）
  animateCount();

  // フォールバック：10秒経っても終わらない場合は強制終了
  setTimeout(function () {
    if (logoIntro.parentNode) {
      logoIntro.classList.add('fadeout');
      loadingScreen.classList.add('hidden');
      setTimeout(function () {
        if (logoIntro.parentNode) logoIntro.remove();
        if (loadingScreen.parentNode) loadingScreen.remove();
      }, 700);
    }
  }, 10000);
})();


// ================================================
// ハンバーガーメニュー
// ================================================
$('.hamburgerMenuButton').on('click', function () {
  $('.hamburgerMenuButton, .hamburgerMenuItemsNav').toggleClass('show');
});

$('#about a[href]').on('click', function (event) {
  $('.hamburgerMenuButton').trigger('click');
});


// ================================================
// スクロールでハンバーガーメニュー表示
// ================================================
window.addEventListener('scroll', function () {
  const elm    = document.querySelector('.hamburgerMenuWrap');
  const scroll = window.pageYOffset;
  if (scroll > 900) {
    elm.style.opacity = '1';
    elm.style.zIndex  = '5';
  } else {
    elm.style.opacity = '0';
    elm.style.zIndex  = '5';
  }
});


// ================================================
// homeWorks セクション：テキストのフェードイン
// ================================================
(function () {
  const targets = document.querySelectorAll(
    '#homeWorks .homeWorksCategoly, #homeWorks .homeWorksTitle, #homeWorks .homeWorksButtonText'
  );

  if (!targets.length) return;

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target); // 一度表示されたら監視解除
      }
    });
  }, {
    threshold: 0.2 // 要素が20%見えたら発火
  });

  targets.forEach(function (el) {
    observer.observe(el);
  });
})();


// ================================================
// 汎用フェードイン：ページごとに対象要素に .js-fadeIn を付与して監視
// ================================================
(function () {

  // --- フェードイン対象を登録するヘルパー ---
  // container : CSSセレクタ文字列
  // mode      : 'text' = p/a/span/li のみ, 'both' = + img も含む
  function registerFadeIn(container, mode) {
    const wrap = document.querySelector(container);
    if (!wrap) return;

    const textSel = 'p, h1, h2, h3, h4, h5, h6, a, span, li';
    const imgSel  = 'img';
    const sel     = mode === 'both' ? textSel + ', ' + imgSel : textSel;

    wrap.querySelectorAll(sel).forEach(function (el, i) {
      el.classList.add('js-fadeIn');
      // 要素ごとに少しずつ遅延させて順番に出てくるようにする
      el.style.transitionDelay = (i * 0.02) + 's';
    });
  }

  // --- index.html ---
  registerFadeIn('#homeAbout',        'text');

  // --- about.html ---
  registerFadeIn('.aboutMv_wrap',     'both');
  registerFadeIn('.aboutContentsWrap','both');
  registerFadeIn('.aboutContactWrap', 'both');

  // --- works.html ---
  registerFadeIn('.worksAllWrap',     'both');

  // --- 各作品ページ ---
  registerFadeIn('.eachWorkPage',        'text');
  registerFadeIn('.eachWorkDetailWrap',  'both');

  // --- IntersectionObserver で監視 ---
  const allTargets = document.querySelectorAll('.js-fadeIn');
  if (!allTargets.length) return;

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05 });

  allTargets.forEach(function (el) { observer.observe(el); });

})();


// ================================================
// ページトップボタン：表示制御 & クリック
// ================================================
(function () {
  const btn = document.getElementById('pageTopBtn');
  if (!btn) return;

  // スクロール量に応じて表示
  window.addEventListener('scroll', function () {
    if (window.pageYOffset > 400) {
      btn.classList.add('is-show');
    } else {
      btn.classList.remove('is-show');
    }
  });

  // クリックでスムーズにトップへ
  btn.addEventListener('click', function (e) {
    e.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();
