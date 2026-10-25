/* Päiväkulku v3j (24.10.2026): kolmeen ensimmäiseen ruutuun oikeat kuvakaappaukset (puhelin ja läppäri; iPad ja iMac paikkamerkkejä). Kierto ennallaan: yksi jatkuva laite ja kokonaiskierto tasan 270 astetta samaan suuntaan
   (puhelin 0, läppäri 90, iPad 180, iMac 270). Jokainen käännös on +90 astetta. Kehys on SVG-polku, kierto CSS rotateZ:lla
   (ei kallistusta). Kamera ja ruudun sisältö ovat kiinni kehyksessä ja näkyvät vain laitteen ollessa paikallaan; kameran paikka
   vaihtuu kehyksellä vain piilossa (levossa aina ruudun yläreunassa). Sisältö on kehyksen sisällä käännetty niin, että se
   näkyy aina oikein päin. Tekstit: _tyo/paivankulku/tekstit.json. Versiotunnus: data-versio="v3r" ja konsolin rivi. */
window.PK_VERSIO='v3r';
(function(){
  var root=document.documentElement, sec=document.getElementById('paiva');
  if(!sec||!sec.querySelector('.pk-track'))return;
  root.classList.add('pk-on'); root.setAttribute('data-pk-js','v3r');
  if(window.console&&console.info)console.info('Paivankulku v3r');
  if(sec.getAttribute('data-versio')!=='v3r'&&window.console&&console.warn)console.warn('Paivankulku: sivun HTML ei ole v3r ('+sec.getAttribute('data-versio')+')');
  var mq=window.matchMedia('(prefers-reduced-motion: reduce)'), mh=window.matchMedia('(max-height: 560px)');
  var track=sec.querySelector('.pk-track'), stage=sec.querySelector('.pk-stage'), box=sec.querySelector('.pk-devices'),
      svg=box.querySelector('.pk-morph'), shadow=box.querySelector('.pk-shadow'),
      fr=svg.querySelector('.pk-frame-p'), clip=svg.querySelector('.pk-clip-p'), scr=svg.querySelector('.pk-scr'),
      base=svg.querySelector('.pk-base-p'), stand=svg.querySelector('.pk-stand-p'), cam=svg.querySelector('.pk-mcam'),
      im=[null,svg.querySelector('.pk-i1'),svg.querySelector('.pk-i2'),svg.querySelector('.pk-i3')], g1=svg.querySelector('.pk-g1'), g2=svg.querySelector('.pk-g2'), g3=svg.querySelector('.pk-g3'), b1=svg.querySelector('.pk-b1'), b2=svg.querySelector('.pk-b2'),
      home=svg.querySelector('.pk-home'), hbtn=svg.querySelector('.pk-hbtn'), hbg=svg.querySelector('.pk-hbtn-bg'),
      hfin=svg.querySelector('.pk-hfin'), hrip=svg.querySelector('.pk-hrip'),
      steps=sec.querySelectorAll('.pk-texts .pk-step'),
      toasts=sec.querySelectorAll('.pk-toast'), prog=sec.querySelectorAll('.pk-dots .pk-dot'),
      labels=[svg.getAttribute('data-l0'),svg.getAttribute('data-l1'),svg.getAttribute('data-l2'),svg.getAttribute('data-l3')];
  var D=null, G=null, active=false, raf=0, ps=0, lastStep=-1, st={};
  sec._pk=st;
  function cl(x){return x<0?0:x>1?1:x}
  function seg(p,a,b){return cl((p-a)/(b-a))}
  function sm(t){return t*t*(3-2*t)}
  /* Kiertokäyrä: nopeus kasvaa ja laskee sinimuotoisesti (30 % kummassakin päässä), keskellä tasainen.
     Kiihtyvyys on jatkuva, ja huippunopeus on pienempi kuin easeInOutSinellä. */
  var RA=.3;
  function rp(t){return t<=RA?(t-RA/Math.PI*Math.sin(Math.PI*t/RA))/2:RA/2+(t-RA)}
  function eio(t){t=cl(t);var A=1-RA;return t<=.5?rp(t)/A:1-rp(1-t)/A}
  function L(a,b,t){return a+(b-a)*t}
  function f1(x){return Math.round(x*10)/10}
  function rr(x,y,w,h,r){r=Math.max(0,Math.min(r,w/2,h/2));
    return 'M'+f1(x+r)+' '+f1(y)+'H'+f1(x+w-r)+'A'+f1(r)+' '+f1(r)+' 0 0 1 '+f1(x+w)+' '+f1(y+r)+'V'+f1(y+h-r)+'A'+f1(r)+' '+f1(r)+' 0 0 1 '+f1(x+w-r)+' '+f1(y+h)+'H'+f1(x+r)+'A'+f1(r)+' '+f1(r)+' 0 0 1 '+f1(x)+' '+f1(y+h-r)+'V'+f1(y+r)+'A'+f1(r)+' '+f1(r)+' 0 0 1 '+f1(x+r)+' '+f1(y)+'Z'}
  /* Laitteiden mitat paikallisessa koordinaatistossa. Läppäri on paikallisesti -90 astetta käännetty:
     paikallinen oikea reuna = ruudun yläreuna (kamera), vasen reuna = alareuna (leuka ja pohjaosa).
     iMac on paikallisesti -270 astetta käännetty: paikallinen vasen reuna = ruudun yläreuna (kamera), oikea reuna =
     alareuna (leuka ja jalusta). iMacin näyttö on 16:9 vaaka. */
  function measure(){
    var cw=box.clientWidth, ch=box.clientHeight; if(!cw||!ch){D=null;return}
    svg.setAttribute('viewBox',(-cw/2)+' '+(-ch/2)+' '+cw+' '+ch);
    var Hp=Math.min(.92*ch,1.6*cw), Wp=Hp/2.075, bp=.04*Wp;
    var Wl=Math.min(.86*cw,.9*ch/.69), bs=.022*Wl, chin=.04*Wl, Hl=.956*Wl*.625+bs+chin;
    var Wi=Math.min(.7*cw,.9*ch/1.3995), bi=.045*Wi, Hi=.91*Wi*1180/820+2*bi;
    var Wm=Math.min(.86*cw,.9*ch/.765), bm=.018*Wm, chm=.075*Wm, Hm=bm+chm+(Wm-2*bm)*9/16;
    D={cw:cw,ch:ch,
      P:{w:Wp,h:Hp,b:[bp,bp,bp,bp],r:.155*Wp,cw:.30*Wp,chh:.034*Hp,ins:bp+.033*Hp},
      Lp:{w:Hl,h:Wl,b:[bs,bs,bs,chin],r:.022*Wl,cw:Math.max(4,.008*Wl),chh:Math.max(4,.008*Wl),ins:bs/2,T:.034*Wl},  /* b: ylä, oikea, ala, vasen */
      I:{w:Wi,h:Hi,b:[bi,bi,bi,bi],r:.075*Wi,cw:Math.max(5,.012*Wi),chh:Math.max(5,.012*Wi),ins:bi/2},
      M:{w:Hm,h:Wm,b:[bm,chm,bm,bm],r:.03*Wm,cw:Math.max(4,.008*Wm),chh:Math.max(4,.008*Wm),ins:bm/2,N:.11*Wm,F:.018*Wm,nw:.26*Wm,fw:.36*Wm}};
    /* v3n: tila, jossa kiertyvä laite saa olla (laitealueen keskipisteestä mitattuna, px). Vasen raja = näkymän vasen reuna
       + safe area + 8 px, oikea raja = pallurasarakkeen vasen reuna - 8 px, ylä = laitealueen yläreuna (teksti on yllä),
       ala = näyttämön alareuna - safe area - 8 px. Jos kiertyvä kehys ei mahdu, frame() pienentää sitä vain sen hetken. */
    var bb=box.getBoundingClientRect(), sb=stage.getBoundingClientRect(), ds=sec.querySelector('.pk-dots'), sa=sec._pkSa,
        bx=bb.left+bb.width/2, by=bb.top+bb.height/2, MG=8;
    if(!sa){sa=document.createElement('div');sa.setAttribute('aria-hidden','true');sa.style.cssText='position:absolute;left:0;top:0;width:0;height:0;visibility:hidden;pointer-events:none;padding:0 env(safe-area-inset-right) env(safe-area-inset-bottom) env(safe-area-inset-left)';stage.appendChild(sa);sec._pkSa=sa;}
    var sc=getComputedStyle(sa), sL=parseFloat(sc.paddingLeft)||0, sR=parseFloat(sc.paddingRight)||0, sB=parseFloat(sc.paddingBottom)||0,
        dl=ds&&ds.offsetWidth?ds.getBoundingClientRect().left:window.innerWidth-sR;
    /* Yläraja: jos tekstit ovat laitteen yläpuolella (mobiili), raja on laatikon yläreuna, jotta laite ei mene tekstin päälle.
       Muuten (työpöytä, tekstit vasemmalla) raja on näyttämön yläreuna + MG, jolloin työpöydän kierto pysyy kuten v3m:ssä. */
    var tx=sec.querySelector('.pk-texts'), tr=tx&&tx.offsetHeight?tx.getBoundingClientRect():null, yla=(tr&&tr.bottom<=bb.top+1)?bb.top:sb.top+MG;
    D.lim={l:bx-(sL+MG), r:(dl-MG)-bx, t:by-yla, b:(sb.bottom-sB-MG)-by};
  }
  /* v3n: kiertyvän laitteen (kehys, läppärin pohjaosa, iMacin jalusta) todellinen ulkoraja kulmassa th. Kerroin k <= 1
     pienentää laitetta keskipisteensä ympäri juuri niin paljon, että kaikki kulmat pysyvät rajojen sisällä. Levossa k = 1
     kaikilla mitatuilla leveyksillä, joten vaiheiden laitekoot eivät muutu; vain kierron keskellä laite voi pienentyä hetkeksi. */
  function fitK(R,th,ty){var c=Math.cos(th*Math.PI/180), s=Math.sin(th*Math.PI/180), x1=0,x2=0,y1=0,y2=0, k=1, lim=D.lim;
    for(var i=0;i<R.length;i++){var q=R[i];for(var j=0;j<4;j++){var x=j&1?q[2]:q[0], y=j&2?q[3]:q[1], X=x*c-y*s, Y=x*s+y*c+ty;
      if(X<x1)x1=X; if(X>x2)x2=X; if(Y<y1)y1=Y; if(Y>y2)y2=Y;}}
    if(!lim)return 1;
    if(x1<0)k=Math.min(k,lim.l/-x1); if(x2>0)k=Math.min(k,lim.r/x2); if(y1<0)k=Math.min(k,lim.t/-y1); if(y2>0)k=Math.min(k,lim.b/y2);
    return k>0&&k<1?k:1}
  function mix(A,B,t,k){var o={w:L(A.w,B.w,t),h:L(A.h,B.h,t),r:L(A.r,B.r,t),b:[],cw:L(A.cw,B.cw,k),chh:L(A.chh,B.chh,k),ins:L(A.ins,B.ins,t)};
    for(var i=0;i<4;i++)o.b[i]=L(A.b[i],B.b[i],t); return o}
  /* Radan paikka ja pituus dokumentissa (px). Luetaan vain latauksessa, leveyden muutoksessa, isossa korkeuden
     muutoksessa (kääntö) ja kun sivun sisältö muuttaa korkeuttaan. iOS:n osoitepalkin heilahdus ei muuta näitä. */
  function geo(){var y=window.pageYOffset||document.documentElement.scrollTop||0, r=track.getBoundingClientRect();
    G={top:r.top+y, span:track.offsetHeight-stage.offsetHeight, tH:track.offsetHeight, sH:stage.offsetHeight, w:window.innerWidth, h:window.innerHeight}}
  /* Jos asettelu oikeasti muuttui (rata tai näyttämö eri korkuinen), mitat luetaan heti uudelleen, jotta kulma vastaa
     aina sitä mitä ruudulla on. Osoitepalkki ei muuta svh-mittoja, joten se ei laukaise tätä. */
  function stale(){return !G||track.offsetHeight!==G.tH||stage.offsetHeight!==G.sH}
  /* Vierityskohta rajattuna sivun alueelle: iOS:n kimmoisa ylivieritys (negatiivinen tai yli maksimin) ei vaikuta. */
  function scrollPos(){var y=window.scrollY; if(typeof y!=='number'||!isFinite(y))y=window.pageYOffset||0;
    var max=Math.max(0,document.documentElement.scrollHeight-window.innerHeight); return y<0?0:y>max?max:y}
  function progress(){if(stale()){var sh=G&&G.sH; geo(); if(sh&&sh!==G.sH)measure();} if(!(G.span>0))return 0; var p=(scrollPos()-G.top)/G.span; return isFinite(p)?cl(p):0}
  function hx(t){ /* napin väri #7CC0FF -> #5FAEF2 painettaessa */
    return 'rgb('+Math.round(L(124,95,t))+','+Math.round(L(192,174,t))+','+Math.round(L(255,242,t))+')'}
  function frame(now){
    raf=0; if(!active)return;
    if(!D){measure(); if(!D)return;}
    var t0=performance.now(), p=progress();
    ps=p;
    /* Sisältö ja kamera häivytetään vierityksen (ei kiertokulman) mukaan kierron ensimmäisellä ja viimeisellä 8 %:lla,
       jolloin laite on kääntynyt enintään noin 2 astetta. Vaiheet: puhelin paikallaan 0...14 (napautus .04...11), kierto 0->90 .14...28,
       läppäri paikallaan .28...43, kierto 90->180 .43...57, iPad paikallaan .57...72, kierto 180->270 .72...86, iMac paikallaan .86...1 */
    var q=ps, t1=seg(q,.14,.28), t2=seg(q,.43,.57), t3=seg(q,.72,.86), m1=eio(t1), m2=eio(t2), m3=eio(t3), s, th, ty=0, rx=0, ry=0, op=[0,0,0,0], co, side;
    if(m2<=0){ s=mix(D.P,D.Lp,m1,sm(seg(m1,0,.7))); th=-90*m1;
      op[0]=1-sm(seg(t1,0,.08)); op[1]=sm(seg(t1,.92,1));
      side=t1<.5?0:1; co=t1<.5?op[0]:op[1];
    }else if(m3<=0){ s=mix(D.Lp,D.I,m2,sm(seg(m2,.3,1))); th=-90-90*m2;
      op[1]=1-sm(seg(t2,0,.08)); op[2]=sm(seg(t2,.92,1));
      side=t2<.5?1:2; co=t2<.5?op[1]:op[2];
    }else{ s=mix(D.I,D.M,m3,sm(seg(m3,0,.7))); th=-180-90*m3;
      op[2]=1-sm(seg(t3,0,.08)); op[3]=sm(seg(t3,.92,1));
      side=t3<.5?2:3; co=t3<.5?op[2]:op[3];
    }
    th=th<-270?-270:th>0?0:th;   /* kulma aina 0...270 astetta */
    /* Läppärin pohjaosa näkyy vain läppärin ollessa (lähes) paikallaan ja vetäytyy ennen toista kiertoa.
       iMacin jalusta tulee esiin kolmannen kierron lopussa. */
    var ex=sm(seg(q,.26,.30))*(1-sm(seg(q,.40,.43))), em=sm(seg(q,.84,.88));
    var w=s.w, h=s.h, b=s.b, x0=-w/2, y0=-h/2;
    var T=D.Lp.T*ex, sl=h*(1+.14*ex), nL=D.M.N*em, fL=D.M.F*em, E=T+nL+fL;
    ty=-E/2;
    fr.setAttribute('d',rr(x0,y0,w,h,s.r));
    var sx=x0+b[3], sy=y0+b[0], sw=w-b[1]-b[3], sh=h-b[0]-b[2], sr=Math.max(2,s.r-Math.max(b[0],b[1]));
    var sp=rr(sx,sy,sw,sh,sr); clip.setAttribute('d',sp); scr.setAttribute('d',sp);
    if(T>.3){base.setAttribute('d',rr(x0-T,-sl/2,T+Math.min(8,w*.05),sl,Math.min(T*.9,sl/2))); base.style.opacity=cl(ex*3).toFixed(3);}
    else base.style.opacity='0';
    if(em>.01){stand.setAttribute('d',rr(x0+w-2,-D.M.nw/2,nL+2,D.M.nw,1.5)+rr(x0+w+nL-.5,-D.M.fw/2,fL+.5,D.M.fw,Math.min(fL/2,4))); stand.style.opacity=cl(em*3).toFixed(3);}
    else stand.style.opacity='0';
    /* Kamera on kiinni kehyksessä: puhelimella paikallinen yläreuna, läppärillä paikallinen oikea reuna
       (= ruudun yläreuna 90 asteessa), iPadilla paikallinen alareuna (= ruudun yläreuna 180 asteessa) ja iMacilla
       paikallinen vasen reuna (= ruudun yläreuna 270 asteessa).
       Paikka vaihtuu vain kun kamera on piilossa, joten näkyvä kamera pyörii aina täsmälleen kehyksen mukana. */
    var cW=Math.max(s.cw,s.chh), cH=s.chh, cx=side===1?(w/2-s.ins):side===3?-(w/2-s.ins):0, cy=(side===1||side===3)?0:side===2?(h/2-s.ins):-(h/2-s.ins);
    cam.setAttribute('x',f1(cx-cW/2)); cam.setAttribute('y',f1(cy-cH/2)); cam.setAttribute('width',f1(cW)); cam.setAttribute('height',f1(cH)); cam.setAttribute('rx',f1(cH/2));
    var ck=m2<=0?sm(seg(m1,.2,.7)):1; cam.style.fill='rgb('+Math.round(36*ck)+','+Math.round(54*ck)+','+Math.round(90*ck)+')';
    cam.style.opacity=co.toFixed(3); cam.style.visibility=co>.002?'visible':'hidden';
    /* Puhelimen näkymä (v3j: kuvakaappaus 390 x 845 pt -koordinaatistossa) ja Aloita kellotus -napautus vierityksen mukaan */
    if(op[0]>.002){var hs=sw/390; home.setAttribute('transform','translate('+f1(sx)+' '+f1(sy)+') scale('+hs.toFixed(4)+')');
      var tp=seg(q,.04,.11), pr=sm(seg(tp,.25,.4))*(1-sm(seg(tp,.55,.75))), fo=sm(seg(tp,0,.2))*(1-sm(seg(tp,.6,.8))), rt=seg(tp,.35,.9);
      if(hbtn){hbtn.setAttribute('transform','translate(195 759) scale('+(1-.035*pr).toFixed(4)+') translate(-195 -759)'); hbg.style.fill=hx(pr);}  /* v3j: kuvakaappauksessa ei erillistä nappia, vain sormi ja aalto napin kohdalla */
      hfin.setAttribute('r',(26-5*pr).toFixed(2)); hfin.style.opacity=fo.toFixed(3);
      hrip.setAttribute('r',(10+190*rt).toFixed(1)); hrip.style.opacity=(rt>0&&rt<1?.3*(1-rt):0).toFixed(3);
      home.style.opacity=op[0].toFixed(3); home.style.visibility='visible';}
    else home.style.visibility='hidden';
    for(var i=1;i<4;i++){var e=im[i]; if(op[i]>.002){
        if(i===1){[e,b1].forEach(function(q){if(!q)return;q.setAttribute('x',f1(-sh/2));q.setAttribute('y',f1(-sw/2));q.setAttribute('width',f1(sh));q.setAttribute('height',f1(sw));});
          g1.setAttribute('transform','translate('+f1(sx+sw/2)+' '+f1(sy+sh/2)+') rotate(90)');}
        else if(i===2){[e,b2].forEach(function(q){if(!q)return;q.setAttribute('x',f1(-sw/2));q.setAttribute('y',f1(-sh/2));q.setAttribute('width',f1(sw));q.setAttribute('height',f1(sh));});  /* v3j: iPadin kuvakaappaus ja sen taustaväri samalla geometrialla */
          g2.setAttribute('transform','translate('+f1(sx+sw/2)+' '+f1(sy+sh/2)+') rotate(180)');}
        else{ /* iMacin paikkamerkki 1600 x 900: ruudulla leveys = paikallinen korkeus sh, korkeus = paikallinen leveys sw */
          var ks=Math.max(sh/1600,sw/900); e.setAttribute('transform','scale('+ks.toFixed(5)+') translate(-800 -450)');
          g3.setAttribute('transform','translate('+f1(sx+sw/2)+' '+f1(sy+sh/2)+') rotate(270)');}
        e.style.opacity=op[i].toFixed(3); e.style.visibility='visible'; if(i===1&&b1){b1.style.opacity=e.style.opacity;b1.style.visibility='visible';} if(i===2&&b2){b2.style.opacity=e.style.opacity;b2.style.visibility='visible';}}
      else{e.style.visibility='hidden'; if(i===1&&b1)b1.style.visibility='hidden'; if(i===2&&b2)b2.style.visibility='hidden';}}
    var RB=[[x0,y0,x0+w,y0+h]]; if(T>.3)RB.push([x0-T,-sl/2,x0+Math.min(8,w*.05),sl/2]); if(em>.01)RB.push([x0+w-2,-D.M.fw/2,x0+w+nL+fL,D.M.fw/2]);
    var kf=fitK(RB,th,ty);  /* v3n: oma nimi, koska k on alempana vaiheen indeksi */
    svg.style.transform='translate3d(0,'+(ty*kf).toFixed(2)+'px,0) rotateZ('+th.toFixed(2)+'deg)'+(kf<1?' scale('+kf.toFixed(4)+')':'');
    var ow=Math.abs(w*Math.cos(th*Math.PI/180))+Math.abs(h*Math.sin(th*Math.PI/180)), oh=Math.abs(w*Math.sin(th*Math.PI/180))+Math.abs(h*Math.cos(th*Math.PI/180));
    shadow.style.transform='translate3d(0,'+f1((oh/2+E/2)*kf)+'px,0) scale('+(ow*kf/100).toFixed(3)+',1)';
    /* Tekstit: teksti näkyy vain laitteen ollessa paikallaan. v3j: tausta on yksi kiinteä liukuväri (pk.css), ei vaihtumisia. */
    var wv=[1-seg(q,.115,.14), seg(q,.28,.305)*(1-seg(q,.405,.43)), seg(q,.57,.595)*(1-seg(q,.695,.72)), seg(q,.86,.885)];
    for(var j=0;j<steps.length;j++){steps[j].style.opacity=wv[j].toFixed(3);steps[j].style.transform='translateY('+((1-wv[j])*10).toFixed(1)+'px)';steps[j].style.visibility=wv[j]<.01?'hidden':'visible';}
    var k=q<.21?0:q<.50?1:q<.79?2:3;
    if(k!==lastStep){lastStep=k;for(var n=0;n<steps.length;n++){if(toasts[n])toasts[n].classList.toggle('on',n===k);if(prog[n]){prog[n].classList.toggle('on',n===k);if(n===k)prog[n].setAttribute('aria-current','step');else prog[n].removeAttribute('aria-current');}steps[n].setAttribute('aria-hidden',n===k?'false':'true');}
      svg.setAttribute('aria-label',labels[k]);}
    /* Ilmoitukset vain kolmessa ensimmäisessä vaiheessa (vaiheeseen 4 ei lisätty ilmoitusta) */
    var still=[q>.11&&q<.135, q>.285&&q<.425, q>.575&&q<.715];
    for(var z=0;z<toasts.length;z++)toasts[z].style.visibility=still[z]?'visible':'hidden';
    st.versio='v3r';st.p=p;st.ps=ps;st.th=th;st.w=w;st.h=h;st.r=s.r;st.rx=rx;st.ry=ry;st.ow=ow;st.oh=oh;st.b=b.slice();st.ex=ex;st.em=em;st.cam=[cx,cy,cW,cH];st.co=co;st.op=op.slice();st.om=0;st.wv=wv.slice();st.k=kf;
    if(sec._pkLog)sec._pkLog.push({t:now,js:performance.now()-t0,th:th,w:w,h:h,r:s.r,ow:ow,oh:oh,rx:rx,ry:ry,b:b.slice(),cam:[cx,cy,cW,cH],op:op.slice(),om:0,ex:ex,em:em,p:p,ps:ps});
  }
  function req(){if(!raf)raf=requestAnimationFrame(frame)}
  var pre=[];function predecode(){if(pre.length)return;[].forEach.call(svg.querySelectorAll('image'),function(im){var i=new Image();i.decoding='async';i.src=im.getAttribute('href');pre.push(i);if(i.decode)i.decode().catch(function(){});});}
  function reset(){geo();measure();predecode();req()}
  function onResize(){ /* osoitepalkin heilahdus: vain uusi kuva, mitat pysyvät */
    if(!G||window.innerWidth!==G.w||Math.abs(window.innerHeight-G.h)>160)reset(); else req()}
  geo();measure();
  if('IntersectionObserver' in window){new IntersectionObserver(function(e){active=e[0].isIntersecting; if(active)reset();},{rootMargin:'100px 0px'}).observe(track);}else{active=true;}
  window.addEventListener('scroll',req,{passive:true});
  window.addEventListener('resize',onResize);
  window.addEventListener('orientationchange',function(){setTimeout(reset,250)});
  window.addEventListener('load',function(){geo();req()});
  if('ResizeObserver' in window){var lastBH=0;new ResizeObserver(function(){var h=document.body.offsetHeight; if(h!==lastBH){lastBH=h;geo();req();}}).observe(document.body);}
  [mq,mh].forEach(function(x){if(x.addEventListener)x.addEventListener('change',reset);});
  /* v3m: pallurat hyppäävät vaiheeseen. Kohta on vaiheen paikallaanolon keskeltä (sama kuin vaihekuvissa),
     joten kierto ja morph kulkevat vierityksen mukana normaalisti. Vähennetty liike: välitön hyppy. */
  var STOP=[.02,.36,.65,.93];
  [].forEach.call(prog,function(b){b.addEventListener('click',function(){var k=+b.getAttribute('data-s'); geo(); if(!(G.span>0))return;
    var y=Math.round(G.top+STOP[k]*G.span), max=Math.max(0,document.documentElement.scrollHeight-window.innerHeight); y=y<0?0:y>max?max:y;
    var inst=mq.matches; try{window.scrollTo({top:y,left:0,behavior:inst?'instant':'smooth'});}catch(e){window.scrollTo(0,y);}
    if(inst){document.documentElement.scrollTop=y;} req();});});
  active=true; req();
})();
