// Initialize your app
var myApp = new Framework7({
    pushState: true,
    animatePages: true,
    swipePanel: "left",
    swipePanelActiveArea: 20,
    modalTitle: "Descartes Lab",
    modalButtonCancel: "Cancelar",
    modalPreloaderTitle: "Carregando...",
    preloadPreviousPage : false,
    uniqueHistory : true
});

// Export selectors engine
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main', {
    // Because we use fixed-through navbar we can enable dynamic navbar
    dynamicNavbar: true
});

var o = true;

function inverte () {
    var swidth = $$("#ba").width() - $$("#searche").width() - $$("#bc").width() - 16; 
    swidth+='px';
    $$("#hc").css('width',swidth);

    if (o) 
    {
        $$("#refresh").hide();
        $$("#hc").css('width',swidth );
        $$("#hc").toggleClass('hi');
        $$("#hd").toggleClass('hi');
        $$("#loc").toggleClass('fa-search, fa-remove');
        $$("#pac-input").focus();
        o = false;
    }else
    {
        $$("#refresh").show();
        $$("#hc").css('width',swidth);
        $$("#hd").toggleClass('hi');
        $$("#hc").toggleClass('hi');
        $$("#loc").toggleClass('fa-search, fa-remove');
        o = true;
    }
 
}

function cancela_rota()
{
    $$("#hb").addClass('hi');
    $$("#refresh").show();
    $$("#searche").show();
    $$("#hd").removeClass('hi');
    ds.setMap(null);
    setMapOnAll(true);
    document.getElementById("rightpanel").style.height = '0';
    document.getElementById("map").style.height = '100%';

    markerCluster.addMarkers(markers);
    markerCluster.resetViewport();
    markerCluster.repaint();
}

function realiza_rota()
{
    if (!o) {
        inverte();
    }
    $$("#searche").hide();
    $$("#hb").removeClass('hi');
    $$("#refresh").hide();
    $$("#hd").addClass('hi');
    $$("#hc").addClass('hi');
    infowindow.close();

    markerCluster.clearMarkers();
    markerCluster.resetViewport();
    markerCluster.repaint();
}