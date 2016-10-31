var xhrTimeout=1000;
var url='http://descarteslab.sc.senai.br/service/';
var urn = 'urn:descartes';
var empresa_id = 0;
var markerCluster;

var myApp = new Framework7({
    pushState: true,
    animatePages: true,
    swipeBackPage: true,
    modalTitle: "DescartesLab",
    modalButtonCancel: "Cancelar",
    modalPreloaderTitle: "Carregando...",
    smartSelectBackText: 'Voltar',
    smartSelectPopupCloseText: 'Fechar',
    smartSelectPickerCloseText: 'Definir',
    init: false,
    preloadPreviousPage : false,
    uniqueHistory : true
});
var $$ = Dom7;

// Add view
var mainView = myApp.addView('.view-main', {
    dynamicNavbar: true
});

var o = true;

function inverte () {
    var swidth = $$("#ba").width(); 
    swidth +='px !important';
    $$("#hc").css('width',swidth);

    if (o) 
    {
        $$("#refresh").hide();
        $$("#popover-btn").hide();
        $$("#hc").css('width',swidth );
        $$("#hc").toggleClass('hi');
        $$("#hd").toggleClass('hi');
        $$("#searche").hide();
        $$("#pac-input").focus();
        o = false;
    }else
    {
        $$("#refresh").show();
        $$("#popover-btn").show();
        $$("#hc").css('width',swidth);
        $$("#hd").toggleClass('hi');
        $$("#hc").toggleClass('hi');
        $$("#searche").show();        
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


inicializar();

$$(document).on('pageInit', function (e) {
    var page = e.detail.page;

    if(page.name === 'index')
    {
      criar_menu();
      inicializar();
    }

    if(page.name === 'login')
    {
      remover_menu();
      if(localStorage.getItem("login_id") != null)
        mainView.router.loadPage('mapa.html');
      else
        $$("#ba").hide();
    }

    if(page.name === 'notificacoes')
    {
      myApp.closePanel();
      setTimeout(function () {
        carregar_notificacoes()
      },300);
    }

    if(page.name === 'addendereco')
    {
      myApp.closePanel();
      setTimeout(function () {
        if (page.query.id) {
          carregar_edicao_endereco(page.query.id,page.query.nome);
        }
      },300);
    }
 
    if(page.name == 'perfil')
    {
      myApp.closePanel();
      setTimeout(function () {
        carregar_perfil();
      },300);      
    }

    if(page.name == 'enderecos')
    {
      myApp.closePanel();
      setTimeout(function () {
        carregar_enderecos();
      },300); 
    }

    if(page.name == 'agendamentos')
    {
      myApp.closePanel();
      setTimeout(function () {
        carregar_agendamentos();
      },30); 
    }

    if(page.name == 'agendar')
    {
      myApp.closePanel();
      setTimeout(function () {
        criar_menu();
        mostrar_enderecos();
        criar_tipos_lixo();
        var calendarDefault = myApp.calendar({
          input: '#data_agendamento',
        });  

        var pickerDevice = myApp.picker({
          input: '#horario_agendamento',
          cols: [
              {
                values: (function () {
                  var arr = [];
                  for (var i = 0; i <= 23; i++) { arr.push(i < 10 ? '0' + i : i); }
                  return arr;
                })(),
              },
              // Divider
              {
                values: ":",
              },
              // Minutes
              {
                values: (function () {
                  var arr = [];
                  for (var i = 0; i <= 59; i++) { arr.push(i < 10 ? '0' + i : i); }
                  return arr;
                })(),
              }
            ]
        });
      },400);
    }
    
});

function mapa_refresh()
{
  myApp.showPreloader();
  setTimeout(function () {
    document.getElementById("rightpanel").style.height = '0';
    document.getElementById("map").style.height = '100%';
    criar_popover();
    inicializar_map();  
    select_pontos();
    myApp.hidePreloader();
  },500);
}

function aplicar_filtro()
{
  myApp.closeModal();
  myApp.showPreloader(); 
  setTimeout(function () {
    inicializar_map();  
    select_pontos();
    myApp.hidePreloader();
  },500);
}

function inicializar()
{
  myApp.onPageInit('index', function (page) {
     if(localStorage.getItem("login_id") == null)
      {
        remover_menu();
        mostrar_tela_login();
      }
      else
      {
        criar_menu();
        mostrar_tela_mapa();
      }
  }).trigger();
  myApp.init();
  if(localStorage.getItem("login_id") != null)
  {
    inicializar_map();
    mapa_refresh();
  }
  //localStorage.removeItem("tutorial");
}

function tutorial()
{
  /*if(localStorage.getItem("tutorial") != 3)
  {
    if(localStorage.getItem("tutorial") == null)
      localStorage.setItem("tutorial",0);

    var popoverHTML = "";
    var component = null;
    
    if(localStorage.getItem("tutorial") == 0)
    {
      component = document.getElementById("map");
      popoverHTML = '<div class="popover" onclose="tutorial();" style="margin-top:50px;z-index:1333331 !important;">'+
                      '<div class="popover-angle"></div>'+
                      '<div class="popover-inner">'+
                        '<div class="content-block">'+
                          '<p style="font-size:18px;">Bem-vindo ao Descartes Lab! Aqui você pode encontrar pontos de coleta de lixo próximos de você.</p>'+
                          '<p style="font-size:12px;">Toque em qualquer lugar para continuar.</p>'+
                        '</div>'+
                      '</div>'+
                    '</div>';
    }
    else if(localStorage.getItem("tutorial") == 1)
    {
      $$('#searche').click();
      component = document.getElementById("searche");
      popoverHTML = '<div class="popover" onclose="tutorial();" style="margin-top:50px;z-index:1333331 !important;">'+
                      '<div class="popover-angle"></div>'+
                      '<div class="popover-inner">'+
                        '<div class="content-block">'+
                          '<p style="font-size:18px;">Pesquise qualquer localização aqui.</p>'+
                          '<p style="font-size:12px;">Toque em qualquer lugar para continuar.</p>'+
                        '</div>'+
                      '</div>'+
                    '</div>';
    }
    else if(localStorage.getItem("tutorial") == 2)
    {
      $$('#searche').click();
      component = document.getElementById("popover-btn");
      popoverHTML = '<div class="popover" onclose="tutorial();" style="z-index:1333331 !important;">'+
                      '<div class="popover-angle"></div>'+
                      '<div class="popover-inner">'+
                        '<div class="content-block">'+
                          '<p style="font-size:18px;">Selecione aqui os tipos de lixo que você precisa descartar.</p>'+
                          '<p style="font-size:12px;">Toque em qualquer lugar para continuar.</p>'+
                        '</div>'+
                      '</div>'+
                    '</div>';
    }

    localStorage.setItem("tutorial",localStorage.getItem("tutorial") + 1);
    myApp.popover(popoverHTML,component);
  }*/
}

function criar_agendamento()
{
  myApp.showPreloader("Agendando coleta...");
  setTimeout(function () {
    var tipo_lixo_id = obter_select(document.getElementById("tipos_lixo_agendamento"));
    if ((document.getElementById("data_agendamento").value != "") && (document.getElementById("horario_agendamento").value != "") && (document.getElementById("quantidade_agendamento").value != "" && tipo_lixo_id.length != 0)) 
    {
      var agendamento_id = ajax_method(false,'agendamento.insert',empresa_id,localStorage.getItem("login_id"),document.getElementById("data_agendamento").value,document.getElementById("horario_agendamento").value,document.getElementById("endereco_id_agendamento").value);
      if(agendamento_id != 0)
      {
        for(var i=0;i<tipo_lixo_id.length;i++)
        {
          var agendamento_has_tipo_lixo_id = ajax_method(false,'agendamento_has_tipo_lixo.insert',tipo_lixo_id[i],agendamento_id,document.getElementById("quantidade_agendamento").value);
        }
        mainView.router.loadPage('agendamentos.html');
      }
      else
        myApp.alert("Erro ao fazer agendamento.");
    }
    else
      myApp.alert("Um ou mais campos foram deixados em branco.");
    mainView.router.back();
    myApp.hidePreloader();
  },500);
}

function carregar_agendamentos()
{
  myApp.showPreloader();
  setTimeout(function () {
    var json_dados = ajax_method(false,"agendamento.select","usuario_id = "+localStorage.getItem("login_id"));
    var agendamento = JSON.parse(json_dados);
    document.getElementById('espera').innerHTML = "";
    document.getElementById('aceitos').innerHTML = "";
    document.getElementById('atrasados').innerHTML = "";
    document.getElementById('realizados').innerHTML = "";
    document.getElementById('cancelados').innerHTML = "";
    document.getElementById('popups-agendamentos').innerHTML = "";
    for(var i=0;i<agendamento.length;i++)
    {

      json_dados = ajax_method(false,'empresa.select_by_id',agendamento[i].empresa_id);
      var empresa = JSON.parse(json_dados);
      json_dados = ajax_method(false,'usuario_has_endereco.select',"endereco_id = "+agendamento[i].endereco_id+" AND usuario_id = "+localStorage.getItem("login_id"));
      var usuario_has_endereco = JSON.parse(json_dados);

      var data = new Date(agendamento[i].data_agendamento);
      var hoje = new Date;
      var html = '<li id="li-agendamento-'+agendamento[i].id+'">'+
                  '<a href="#" class="item-link open-popup" data-popup=".popup-agendamento-'+agendamento[i].id+'">'+
                    '<div class="item-content">' +
                      '<div class="item-inner">'+
                        '<div class="item-title">'+empresa[0].nome_fantasia+' - '+usuario_has_endereco[0].nome+'</div>'+
                      '</div>'+
                   '</div>'+
                   '</a>'+
                 '</li>';

      var justificativa = '<li class="item-content"><div class="item-title">Justificativa</div><div class="item-after">'+agendamento[i].justificativa+'</div></li>';

      if(agendamento[i].justificativa == null)
        justificativa = "";
      var btn = '<p id="btn-cancelar-'+agendamento[i].id+'"><a onclick="cancelar_agendamento('+agendamento[i].id+',`'+empresa[0].nome_fantasia+'`,`'+usuario_has_endereco[0].nome+'`);" style="width:90%;margin-left:5%;" class="button button-raised button-fill color-red swipeout-delete">Cancelar agendamento</a></p>';
      if((agendamento[i].aceito == 0) && (agendamento[i].realizado == 0))
        document.getElementById('espera').innerHTML += html;
      else if((agendamento[i].aceito == 1) && (agendamento[i].realizado == 0) && (data < hoje))
        document.getElementById('atrasados').innerHTML += html;
      else if((agendamento[i].aceito == 1) && (agendamento[i].realizado == 0))
        document.getElementById('aceitos').innerHTML += html;
      else if((agendamento[i].aceito == 1) && (agendamento[i].realizado == 1) && (data >= hoje))
      {
        document.getElementById('realizados').innerHTML += html;
        btn = "";
      }
      else if((agendamento[i].aceito == 0) && (agendamento[i].realizado == 1))
      {
        document.getElementById('cancelados').innerHTML += html;
        btn = "";
      }

      json_dados = ajax_method(false,'agendamento_has_tipo_lixo.select_by_agendamento',agendamento[i].id);
      var agendamento_has_tipo_lixo = JSON.parse(json_dados);
      var tipos_lixo = "";
      if(agendamento_has_tipo_lixo.length == 0)
        tipos_lixo = "Nenhum";

      for(var j=0;j<agendamento_has_tipo_lixo.length;j++)
      {
        json_dados = ajax_method(false,'tipo_lixo.select_by_id',agendamento_has_tipo_lixo[j].tipo_lixo_id);
        var tipo_lixo = JSON.parse(json_dados);
        if(j!=0)
          tipos_lixo += ', ';
        tipos_lixo += tipo_lixo[0].nome;
      }
      var quantidade = "";
      if(agendamento_has_tipo_lixo.length > 0)
      {
        quantidade = '<li class="item-content"><div class="item-title">Quantidade média (Kg)</div><div class="item-after">'+agendamento_has_tipo_lixo[0].quantidade+'</div></li>';
      }

      document.getElementById("popups-agendamentos").innerHTML += '<div class="popup popup-agendamento-'+agendamento[i].id+'">'+
                                                                  '<div class="navbar">'+
                                                                    '<div class="navbar-inner">'+
                                                                      '<div class="left">'+
                                                                        '<a href="#" class="link icon-only close-popup" id="bc"><i class="icon icon-back"></i></a>'+
                                                                        '<div id="hd">'+
                                                                          'Detalhes do agendamento'+
                                                                        '</div>'+
                                                                      '</div>'+
                                                                    '</div>'+
                                                                  '</div>'+
                                                                '<div class="content-block">'+
                                                                  '<div class="list-block">'+
                                                                    '<ul id="ul-agendamento-'+agendamento[i].id+'">'+
                                                                      '<li class="item-content"><div class="item-title">Tipos de lixo</div><div class="item-after">'+tipos_lixo+'</div></li>'+
                                                                      quantidade+
                                                                      '<li class="item-content"><div class="item-title">Empresa</div><div class="item-after">'+empresa[0].nome_fantasia+'</div></li>'+
                                                                      '<li class="item-content"><div class="item-title">Endereço</div><div class="item-after">'+usuario_has_endereco[0].nome+'</div></li>'+
                                                                      '<li class="item-content"><div class="item-title">Data agendada</div><div class="item-after">'+agendamento[i].data_agendamento+'</div></li>'+
                                                                      '<li class="item-content"><div class="item-title">Horário agendado</div><div class="item-after">'+agendamento[i].horario+'</div></li>'+
                                                                      justificativa+
                                                                    '</ul>'+
                                                                    btn+
                                                                  '</div>'+
                                                                '</div>'+
                                                              '</div>';

      
    }
    myApp.hidePreloader();
  },500);
}

function cancelar_agendamento(id,empresa,endereco)
{
 // myApp.prompt(`Qual a justificativa do cancelamento?`, function (value) {
    myApp.closeModal('.popup-agendamento-'+id);
    var json = ajax_method(false,'agendamento.cancelar',id,value);
    var html = '<li id="li-agendamento-'+id+'">'+
                  '<a href="#" class="item-link open-popup" data-popup=".popup-agendamento-'+id+'">'+
                    '<div class="item-content">' +
                      '<div class="item-inner">'+
                        '<div class="item-title">'+empresa+' - '+endereco+'</div>'+
                      '</div>'+
                   '</div>'+
                   '</a>'+
                 '</li>';
    document.getElementById('li-agendamento-'+id).remove();
    document.getElementById('cancelados').innerHTML += html;
    document.getElementById("ul-agendamento-"+id).innerHTML += '<li class="item-content"><div class="item-title">Justificativa</div><div class="item-after">'+value+'</div></li>';
    myApp.showTab('#cancelados');
    $$("#btn-cancelar-"+id).remove();
 // });
}

function adicionar_endereco()
{
  myApp.showPreloader();
  setTimeout(function () {
    var endereco_id = ajax_method(false,'endereco.insert',document.getElementById("rua").value,document.getElementById("numero").value,document.getElementById("complemento").value,document.getElementById("cep").value,document.getElementById("bairro").value,document.getElementById("estado").value,document.getElementById("cidade").value,document.getElementById("pais").value,document.getElementById("lat").value,document.getElementById("long").value);
    if(endereco_id != 0)
    {
      var usuario_has_endereco_id  = ajax_method(false,'usuario_has_endereco.insert',localStorage.getItem("login_id"),endereco_id,document.getElementById("nome").value);
      if(usuario_has_endereco_id == 0)
      {
        var retorno = ajax_method(false,'endereco.delete',retorno);
        myApp.alert("Seu endereco não pôde ser criado, reveja suas informações ou sua conexão por favor.");
      }
      else
      {
        mainView.router.back();
        carregar_enderecos();
      }
    }
    else
      myApp.alert("Seu endereco não pôde ser criado, reveja suas informações ou sua conexão por favor.");
    myApp.hidePreloader();
  },500);
}

function carregar_enderecos()
{
  myApp.showPreloader();
  setTimeout(function () {
    var json_dados = ajax_method(false,"usuario_has_endereco.select","usuario_id = "+localStorage.getItem("login_id"));
    var usuario_has_endereco = JSON.parse(json_dados);
    document.getElementById('ulenderecos').innerHTML = "";
    document.getElementById('popups-enderecos').innerHTML = "";
    for(var i=0;i<usuario_has_endereco.length;i++)
    {
      json_dados = ajax_method(false,'endereco.select_by_id',usuario_has_endereco[i].endereco_id);
      var endereco = JSON.parse(json_dados);
      var html = '<li id="li-endereco-'+usuario_has_endereco[i].id+'">'+
                  '<a href="#" class="item-link open-popup" data-popup=".popup-endereco-'+usuario_has_endereco[i].id+'">'+
                    '<div class="item-content">' +
                      '<div class="item-inner">'+
                        '<div class="item-title">';
      if (localStorage.getItem("lat_padrao")==endereco[0].latitude && localStorage.getItem("long_padrao")==endereco[0].longitude)
        html+='<i class="fa fa-star"> </i>';
      else
        html+='<i class="fa fa-university"> </i>';

                        html += usuario_has_endereco[i].nome+'</div>'+
                      '</div>'+
                   '</div>'+
                   '</a>'+
                 '</li>';
      botaum = "seleciona("+usuario_has_endereco[i].id+","+endereco[0].latitude+","+endereco[0].longitude+");"; 

      document.getElementById("popups-enderecos").innerHTML += '<div class="popup popup-endereco-'+usuario_has_endereco[i].id+'">'+
                                                                  '<div class="navbar">'+
                                                                    '<div class="navbar-inner">'+
                                                                      '<div class="left">'+
                                                                        '<a href="#" class="link icon-only close-popup" id="bc"><i class="icon icon-back"></i></a>'+
                                                                        '<div id="hd">'+
                                                                          'Detalhes do endereco'+
                                                                        '</div>'+
                                                                      '</div>'+
                                                                    '</div>'+
                                                                  '</div>'+
                                                                '<div class="content-block">'+
                                                                  '<div class="list-block">'+
                                                                    '<ul id="ul-endereco-'+usuario_has_endereco[i].id+'">'+
                                                                      '<li class="item-content"><div class="item-title">Nome do endereço</div><div class="item-after">'+usuario_has_endereco[i].nome+'</div></li>'+
                                                                      '<li class="item-content"><div class="item-title">Rua</div><div class="item-after">'+endereco[0].rua+'</div></li>'+
                                                                      '<li class="item-content"><div class="item-title">Numero</div><div class="item-after">'+endereco[0].num+'</div></li>'+
                                                                      '<li class="item-content"><div class="item-title">Complemento</div><div class="item-after">'+endereco[0].complemento+'</div></li>'+
                                                                      '<li class="item-content"><div class="item-title">Estado</div><div class="item-after">'+endereco[0].uf+'</div></li>'+
                                                                      '<li class="item-content"><div class="item-title">Cidade</div><div class="item-after">'+endereco[0].cidade+'</div></li>'+
                                                                      '<li class="item-content"><div class="item-title">Bairro</div><div class="item-after">'+endereco[0].bairro+'</div></li>'+
                                                                      '<li class="item-content"><div class="item-title">País</div><div class="item-after">'+endereco[0].pais+'</div></li>'+
                                                                    '</ul>'+
                                                                    '<div id="bot'+usuario_has_endereco[i].id+'"></div>'+
                                                                    '<p><a style="width:90%;margin-left:5%;" onclick="myApp.closeModal(`.popup-endereco-'+usuario_has_endereco[i].id+'`);" href="addendereco.html?id='+usuario_has_endereco[i].endereco_id+'&nome='+usuario_has_endereco[i].nome+'" class="button button-raised button-fill color-orange">Editar</a></p>'+
                                                                    '<p><a style="width:90%;margin-left:5%;" onclick="myApp.closeModal(`.popup-endereco-'+usuario_has_endereco[i].id+'`); excluir_endereco('+usuario_has_endereco[i].endereco_id+')" class="button button-raised button-fill color-red">Excluir</a></p>'+
                                                                  '</div>'+
                                                                '</div>'+
                                                              '</div>';
    document.getElementById("ulenderecos").innerHTML += html;
    if (localStorage.getItem("lat_padrao")!=endereco[0].latitude && localStorage.getItem("long_padrao")!=endereco[0].longitude)
      document.getElementById('bot'+usuario_has_endereco[i].id).innerHTML ='<p><a onclick="seleciona('+usuario_has_endereco[i].id+','+endereco[0].latitude+','+endereco[0].longitude+');" style="width:90%;margin-left:5%;" class="button button-raised button-fill color-green">Definir como principal</a><p>';
    }
    myApp.hidePreloader();
  },500);
}

function carregar_notificacoes()
{
  myApp.showPreloader();
  setTimeout(function () {
    var json_dados = ajax_method(false,'notificacao.visualizar_todos_by_usuario',localStorage.getItem("login_id"));
    json_dados = ajax_method(false,'notificacao.select_by_usuario',localStorage.getItem("login_id"));
    var retorno = JSON.parse(json_dados);
    html = '';
    for (i = 0; i < retorno.length; i++)
    {
      if (retorno[i].destino == 0) {
        json_dados = ajax_method(false,'empresa.select_by_id',retorno[i].empresa_id);
        var empresa = JSON.parse(json_dados);
        html += '<li class="item-link swipeout">'+
                    '<div class="swipeout-content item-content">';
        if (retorno[i].tipo == 0)
          html += '<div class="item-media"><i class="fa fa-hourglass-2"></i></div><div class="item-inner">'+empresa[0].nome_fantasia+' aceitou o agendamento.</div>';
        if (retorno[i].tipo == 1)
          html += '<div class="item-media"><i class="fa fa-calendar-times-o"></i></div><div class="item-inner">'+empresa[0].nome_fantasia+' recusou o agendamento.</div>';
        html +='</div><div class="swipeout-actions-right"><a onclick="excluir_notificacao('+retorno[i].id+');" class="bg-red swipeout-delete">Excluir</a></div></li>';
      }
    }
    document.getElementById('ulnotificacoes').innerHTML = html;
    myApp.hidePreloader();
  },500);
}

function carregar_perfil()
{
  myApp.showPreloader();
  setTimeout(function () {
    var json_dados = ajax_method(false,'usuario.select',"id = "+localStorage.getItem("login_id"));
    var usuario = JSON.parse(json_dados);
    document.getElementById("usuario_nome").value = usuario[0].nome;
    document.getElementById("usuario_email").value = usuario[0].email;
    document.getElementById("usuario_telefone").value = usuario[0].telefone;
    myApp.hidePreloader();
  },100);
}

function alterar_perfil()
{
  myApp.showPreloader();
  setTimeout(function () {
    var json_dados = ajax_method(false,'usuario.update_perfil',localStorage.getItem("login_id"),document.getElementById("usuario_nome").value,document.getElementById("usuario_email").value,document.getElementById("usuario_telefone").value);
    var retorno = JSON.parse(json_dados);
    if(retorno)
      myApp.alert("Perfil alterado com sucesso.");
    else
      myApp.alert("Erro ao alterar perfil.");
  myApp.hidePreloader();
  },100);

  mainView.router.loadPage('perfil.html');
}

function alterar_senha()
{
  if (document.getElementById("usuario_senha1").value != "" && document.getElementById("usuario_senha2").value != "") {
    if(document.getElementById("usuario_senha1").value == document.getElementById("usuario_senha2").value)
    {
      var json_dados = ajax_method(false,'usuario.update_senha',localStorage.getItem("login_id"),document.getElementById("usuario_senha_antiga").value,document.getElementById("usuario_senha1").value);
      var retorno = JSON.parse(json_dados);
      if(retorno)
      {
        myApp.alert("Senha alterada com sucesso.");
        mainView.router.loadPage('perfil.html');
      }
      else
        myApp.alert("Erro ao alterar senha.");
    }
    else
      myApp.alert("Senhas não coincidem.");
  }
  else
  {
    myApp.alert("Um ou mais campos foram deixados em branco.");
  }
}

function criar_menu()
{
  var panel_html = '<li><a href="index.html" class="item-link">'+
                      '<div class="item-content">'+
                        '<div class="item-inner"> '+
                          '<div class="item-title">Mapa</div>'+
                        '</div>'+
                      '</div></a></li>'+
                    '<li><a href="perfil.html" class="item-link">'+
                        '<div class="item-content">' +
                          '<div class="item-inner">'+
                            '<div class="item-title">Perfil</div>'+
                          '</div>'+
                       ' </div></a></li>'+
                      '<li><a href="agendamentos.html" class="item-link">'+
                        '<div class="item-content"> '+
                          '<div class="item-inner">'+
                            '<div class="item-title">Agendamentos</div>'+
                          '</div>'+
                        '</div></a></li>'+
                    '<li><a href="enderecos.html" class="item-link">'+
                        '<div class="item-content"> '+
                          '<div class="item-inner">'+
                            '<div class="item-title">Endereços</div>'+
                          '</div>'+
                        '</div></a></li>'+
                    '<li><a href="notificacoes.html" class="item-link">'+
                        '<div class="item-content"> '+
                          '<div class="item-inner">'+
                            '<div class="item-title">Notificações</div>'+
                          '</div>'+
                        '</div></a></li>'+
                    '<li><a href="sobre.html" class="item-link" onclick="myApp.closePanel();">'+
                      '<div class="item-content">'+
                        '<div class="item-inner"> '+
                          '<div class="item-title">Sobre</div>'+
                        '</div>'+
                      '</div></a></li>'+
                    '<li><a href="#" class="item-link" onclick="logout();">'+
                        '<div class="item-content"> '+
                          '<div class="item-inner">'+
                            '<div class="item-title">Logout</div>'+
                          '</div>'+
                        '</div></a></li>';
  document.getElementById("local_panel").innerHTML = panel_html;
}

function mostrar_tela_mapa()
{
  document.getElementById("index_page").innerHTML = '<div data-page="mapa" class="page">'+
                                                      '<div class="page-content">'+
                                                        '<div id="map"></div>'+
                                                        '<div id="rightpanel"></div>'+
                                                      '</div>'+
                                                    '</div>';

}

function mostrar_tela_login()
{
  $$("#ba").hide();
  document.getElementById("index_page").innerHTML = '<div data-page="login-screen" class="page no-navbar no-toolbar no-swipeback">'+
                                                      '<div class="page-content login-screen-content">'+
                                                        '<div class="login-screen-title"><img src="img/login.png" width="90%" height="5%"></div>'+
                                                          '<div class="list-block">'+
                                                            '<ul>'+
                                                              '<li class="item-content">'+
                                                                '<div class="item-inner">'+
                                                                  '<div class="item-title label">Email</div>'+
                                                                    '<div class="item-input">'+
                                                                      '<input type="email" name="login_email" id="login_email" placeholder="ex: joão@batata.com" required>'+
                                                                    '</div>'+
                                                                '</div>'+
                                                              '</li>'+
                                                              '<li class="item-content">'+
                                                                '<div class="item-inner">'+
                                                                  '<div class="item-title label">Senha</div>'+
                                                                    '<div class="item-input">'+
                                                                      '<input type="password" name="login_senha" id="login_senha" placeholder="ex: *******" required>'+
                                                                    '</div>'+
                                                                '</div>'+
                                                              '</li>'+
                                                            '</ul>'+
                                                          '</div>'+
                                                          '<div class="list-block-label" style="padding-left:15px;padding-right:15px;">'+
                                                              '<p><a onclick="login();" class="button">Entrar</a></p>'+
                                                              '<p><a href="cadastro.html" class="button">Não possui cadastro? Clique aqui!</a></p>'+
                                                          '</div>'+
                                                        '</div>'+
                                                      '</div>'+
                                                      '</div>'+
                                                    '</div>';
}

function remover_menu()
{
  document.getElementById("local_panel").innerHTML = '<p>Você não realizou o login!</p>';
}

function login()
{
  var email = document.getElementById("login_email").value;
  var senha = document.getElementById("login_senha").value;
  var id = null;

  myApp.showPreloader();
  setTimeout(function () {
    id = ajax_method(false,'usuario.login',email,senha);

    if (id != 0)
    {
      localStorage.setItem("login_id",id);
      $$("#ba").show();
      cria_login();
      criar_menu();
      mostrar_tela_mapa();
      //mapa_refresh();
    }
    else
    {
      myApp.alert('Email ou senha não correspondem!');
    }
    myApp.hidePreloader();
    mainView.refreshPage();
  },100);
}

function cria_login(){
  document.getElementById('ba').innerHTML = '<div class="navbar-inner"  style="padding: 0 0 0 8px !important">'+
                                               ' <div class="left">'+
                                                  '<a href="#" class="link icon-only open-panel" id="bc"> <i class="icon icon-bars"></i></a>'+
                                                  '<div id="hd">'+
                                                   ' DescartesLab'+
                                                 ' </div>'+
                                               ' </div>'+
                                               ' <div id="hc" class="hi" style="width:100%;">'+
                                                  '<form data-search-list=".list-block-search" data-search-in=".item-title" class="searchbar searchbar-init">'+
                                                   ' <div class="searchbar-input">'+
                                                     ' <input id="pac-input" class="controls" type="search" placeholder="Localidade" data-tap-disabled="true">'+
                                                   ' </div>'+
                                                    '<a href="#" class="searchbar-cancel" onclick="inverte();">Cancelar</a>'+
                                                  '</form>'+
                                                '</div>'+
                                                '<div class="center">'+
                                                  '<div onclick="cancela_rota();" id="hb" class="hi">'+
                                                   ' Apagar Rota <i class="fa fa-remove"></i>'+
                                                  '</div>'+
                                                '</div>'+
                                                '<div class="right" style="margin-left: 0 !important">'+
                                                  '<a href="#" class="link icon-only open-popover" id="popover-btn" style="width:30px !important; min-width: 0 !important;">'+
                                                    '<i class="fa fa-filter"></i>'+
                                                 ' </a>'+
                                                  '<a onclick="mapa_refresh();" class="link icon-only" id="refresh" style="width:30px !important; min-width: 0 !important;">'+
                                                   ' <i class="fa fa-refresh"></i>'+
                                                  '</a>'+
                                                 ' <a onclick="inverte();" id="searche" class="link icon-only" style="width:30px !important; min-width: 0 !important;margin-right: 10px;">'+
                                                      '<i class="fa fa-search" id="loc"></i>'+
                                                  '</a>'+
                                               ' </div>'+
                                              '</div>';
}

function logout()
{
  myApp.closePanel();
  $$("#ba").hide();
  localStorage.removeItem("login_id");
  localStorage.removeItem("lat_padrao");
  localStorage.removeItem("long_padrao");
  mainView.router.back();
  remover_menu();
  mostrar_tela_login();
}

function select_pontos()
{
  if (localStorage.getItem("long_padrao") != null) {
    var json_dados = ajax_method(false,'tipo_lixo.select','');
    var tipo_lixo = JSON.parse(json_dados);
    var num = 0;
    var condicao = '';
    for(var j=0;j<tipo_lixo.length;j++)
    {
      if(document.getElementById("tipo_lixo_"+tipo_lixo[j].id).checked == true)
      {
        if(num != 0)
          condicao += " OR";
        condicao += " tipo_lixo_id = "+tipo_lixo[j].id;
        num++;
      }
    }


    json_dados = ajax_method(false,'ponto.select_by_coordenadas',localStorage.getItem("lat_padrao"),localStorage.getItem("long_padrao"));
    var ponto = JSON.parse(json_dados);

    setMapOnAll(null);
    markers = [];

    for(var i=0;i<ponto.length;i++)
    {
      var condi = " ponto_id = "+ponto[i].id+" AND ("+condicao+")";

      if(num == 0)
        condi = " ponto_id = "+ponto[i].id;

      json_dados = ajax_method(false,'tipo_lixo_has_ponto.select',condi);
      tipo_lixo_has_ponto = JSON.parse(json_dados);

      if(tipo_lixo_has_ponto.length > 0)
      {
        json_dados = ajax_method(false,'tipo_lixo_has_ponto.select'," ponto_id = "+ponto[i].id);
        tipo_lixo_has_ponto = JSON.parse(json_dados);
        var tipos_lixo = '';
        for(j=0;j<tipo_lixo.length;j++)
        {
          var add = false;
          for(var h=0;h<tipo_lixo_has_ponto.length;h++)
            if(!add && (tipo_lixo[j].id == tipo_lixo_has_ponto[h].tipo_lixo_id))
            {
              tipos_lixo += '<li class="item-content"><div class="item-title">'+tipo_lixo[j].nome+'</div></li>';
              add = true;
            }
        }
        json_dados = ajax_method(false,'endereco.select_by_id',ponto[i].endereco_id);
        document.getElementById("popups").innerHTML += '<div class="popup popup-ponto_'+ponto[i].id+'">'+
                                                          '<div class="navbar">'+
                                                            '<div class="navbar-inner">'+
                                                              '<div class="left">'+
                                                                '<a href="#" class="link icon-only close-popup" id="bc"><i class="icon icon-back"></i></a>'+
                                                                '<div id="hd">'+
                                                                  'Tipos de lixo do ponto'+
                                                                '</div>'+
                                                              '</div>'+
                                                            '</div>'+
                                                          '</div>'+
                                                        '<div class="content-block">'+
                                                          '<div class="list-block">'+
                                                            '<ul>'+
                                                              tipos_lixo+
                                                            '</ul>'+
                                                          '</div>'+
                                                        '</div>'+
                                                      '</div>';
        var endereco = JSON.parse(json_dados);
        var features = [];
        features["type"] = "mark1";
        features["position"] = new google.maps.LatLng(endereco[0].latitude,endereco[0].longitude);
        features["info"] = '<div class="list-block">'+
                             '<ul>'+
                                '<li>'+
                                  '<a href="#" class="item-link open-popup" data-popup=".popup-ponto_'+ponto[i].id+'">'+
                                    '<div class="item-content">' +
                                      '<div class="item-inner">'+
                                        '<div class="item-title">Ver tipos de lixo</div>'+
                                      '</div>'+
                                   '</div>'+
                                   '</a>'+
                                 '</li>'+
                                '<li><div class="item-content"><div class="item-title">Funcionamento</div><div class="item-after">'+ponto[i].atendimento_ini+' - '+ponto[i].atendimento_fim+'</div></div></li>'+
                             '</ul>'+
                             '<p class="buttons-row">'+
                               '<a href="agendar.html" onclick="empresa_id='+ponto[i].empresa_id+';" style="width:100%" class="button button-raised button-fill color-green">Agende sua coleta</a>'+
                             '</p>'+
                             '<p class="buttons-row">'+
                               '<a href="#" style="width:100%" class="button button-raised button-fill color-blue" onclick ="calculateAndDisplayRoute'+
                               '('+endereco[0].latitude+','+endereco[0].longitude+')">Criar rota</a>'+
                             '</p>'
                           '</div>';
        features["draggable"] = false;
        addMarker(features);
      }
    }
    markerCluster = new MarkerClusterer(map, markers, options); 
  }
  else{
    myApp.alert("Não pudemos carregar os pontos próximos a você pois você ainda não adicionou ou definiu um endereço como principal. Por favor faça-o.")
  }
}

function mostrar_enderecos()
{
  var json_dados = ajax_method(false,'usuario_has_endereco.select','usuario_id = '+localStorage.getItem("login_id"));
  var usuario_has_endereco = JSON.parse(json_dados);
  var html = "<option value='0' selected>Nada selecionado</option>";

  for(var i=0;i<usuario_has_endereco.length;i++)
    html += '<option value='+usuario_has_endereco[i].endereco_id+'>'+usuario_has_endereco[i].nome+'</option>';
  document.getElementById("endereco_id_agendamento").innerHTML = html;
}

function criar_tipos_lixo()
{
  var json_dados = ajax_method(false,'tipo_lixo.select','');
  var tipo_lixo = JSON.parse(json_dados);
  var html = "";

  for(var i=0;i<tipo_lixo.length;i++)
    html += '<option value='+tipo_lixo[i].id+'>'+tipo_lixo[i].nome+'</option>';
  document.getElementById("tipos_lixo_agendamento").innerHTML = html;
}

function criar_popover()
{
  var component = document.getElementById("ul-filtros-materiais");
  var html = '';

  var json_dados = ajax_method(false,'tipo_lixo.select','');
  var tipo_lixo = JSON.parse(json_dados);

  for(var i=0;i<tipo_lixo.length;i++)
    html += '<li>'+
              '<label class="label-checkbox item-content">'+
                '<input type="checkbox" id="tipo_lixo_'+tipo_lixo[i].id+'" name="tipo_lixo_'+tipo_lixo[i].id+'" value='+tipo_lixo[i].id+'>'+
                '<div class="item-media">'+
                  '<i class="icon icon-form-checkbox"></i>'+
                '</div>'+
                '<div class="item-inner">'+
                  '<div class="item-title">'+tipo_lixo[i].nome+'</div>'+
                '</div>'+
              '</label>'+
            '</li>';
  component.innerHTML = html;
}

function ajax_method()
{
  var method = arguments[1];
  var sync = arguments[0];

  var retorno = null;

  var soapMessage ='<?xml version="1.0" encoding="UTF-8"?><SOAP-ENV:Envelope SOAP-ENV:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/" xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/" xmlns:tns="'+urn+'"> <SOAP-ENV:Body><tns:'+method+' xmlns:tns="'+urn+'">';
  for (var i = 2; i < arguments.length; i++)
    soapMessage += '<input'+i+' xsi:type="xsd:string">'+arguments[i]+'</input'+i+'>';
  
  soapMessage += '</tns:'+method+'></SOAP-ENV:Body></SOAP-ENV:Envelope>';

  if(window.XMLHttpRequest) {
      httpRequest = new XMLHttpRequest();
  }
  else if (window.ActiveXObject) { 
    httpRequest = new ActiveXObject("Microsoft.XMLHTTP"); 
  }
  httpRequest.open("POST",url,sync);
  httpRequest.withCredentials = true;
  if (httpRequest.overrideMimeType) { 
    httpRequest.overrideMimeType("text/xml"); 
  }

  httpRequest.onreadystatechange = function (){
    if((httpRequest.readyState == 4) && (httpRequest.status==200))
    {
      clearTimeout(xhrTimeout);

      var parser = new DOMParser();
      var responseDoc = parser.parseFromString(httpRequest.responseText, "text/html");
      var json_dados = responseDoc.getElementsByTagName("return")[0].childNodes[0].nodeValue;
      retorno = json_dados;
    }
  };

  httpRequest.setRequestHeader("Man","POST "+url+" HTTP/1.1")       

  httpRequest.setRequestHeader("MessageType", "CALL");

  httpRequest.setRequestHeader("Content-Type", "text/xml");

  httpRequest.send(soapMessage);

  return retorno;
}

function codeAddress() {
    var address = document.getElementById( 'cidade' ).value+', '+document.getElementById( 'estado' ).value+ ', '+ document.getElementById( 'rua' ).value+' '+ document.getElementById( 'numero' ).value;
    geocoder.geocode( { 'address' : address }, function( results, status ) {
        if( status == google.maps.GeocoderStatus.OK ) {
            document.getElementById( 'lat' ).value = results[0].geometry.location.lat();
            document.getElementById( 'long' ).value = results[0].geometry.location.lng();
            adicionar_endereco();
        } else {
            myApp.alert( 'Não podemos encontrar sua localização corretamente, por favor, reveja os dados.');
        }
    } );
}

function codeAddressa() {
    var address = document.getElementById( 'cidade' ).value+', '+document.getElementById( 'estado' ).value+ ', '+ document.getElementById( 'rua' ).value+' '+ document.getElementById( 'numero' ).value;
    geocoder.geocode( { 'address' : address }, function( results, status ) {
        if( status == google.maps.GeocoderStatus.OK ) {
            document.getElementById( 'lat' ).value = results[0].geometry.location.lat();
            document.getElementById( 'long' ).value = results[0].geometry.location.lng();
            editar_endereco();
        } else {
            myApp.alert( 'Não podemos encontrar sua localização corretamente, por favor, reveja os dados.');
        }
    } );
}

function cadastro()
{
  if(document.getElementById("cad_senha").value == document.getElementById("cad_senha2").value)
  {
    myApp.showPreloader("Realizando cadastro...");
    setTimeout(function () {
      var adduser = ajax_method(false,'usuario.insert',document.getElementById("cad_nome").value,document.getElementById("cad_email").value,document.getElementById("cad_senha").value,document.getElementById("cad_cpf").value,document.getElementById("cad_telefone").value);
      myApp.hidePreloader();
      if(adduser != 0)
      {
        localStorage.setItem("login_id",adduser);
        mainView.router.back();
        myApp.alert("Cadastro realizado com êxiito! Faça o login para continuar.");
      }
      else
        myApp.alert("Seu perfil não pôde ser criado, reveja suas informações ou sua conexão por favor.");
    },500);
  }
  else
    myApp.alert("Senhas não correspondem!");
}

function seleciona(id,lat,long)
{
  localStorage.setItem('lat_padrao',lat);
  localStorage.setItem('long_padrao',long);
  mainView.router.refreshPage();
  myApp.closeModal('.popup-endereco-'+id);
}

function carregar_edicao_endereco(id,nome)
{
    id = parseInt(id);
    myApp.showPreloader();
    setTimeout(function () {
      var json_dados = ajax_method(false,'endereco.select_by_id',id);
      var retorno = JSON.parse(json_dados);

      document.getElementById('nome').value = nome;
      document.getElementById('nome').disabled = true;
      document.getElementById('rua').value = retorno[0].rua;
      document.getElementById('numero').value = retorno[0].num;
      document.getElementById('complemento').value = retorno[0].complemento;
      document.getElementById('cep').value = retorno[0].cep;
      document.getElementById('bairro').value = retorno[0].bairro;
      document.getElementById('estado').value = retorno[0].uf;
      document.getElementById('cidade').value = retorno[0].cidade;
      document.getElementById('pais').value = retorno[0].pais;
      document.getElementById('lat').value = retorno[0].latitude;
      document.getElementById('long').value = retorno[0].longitude;
      document.getElementById('id').value = id;
      $$("#salvar").toggleClass('hi');
      $$("#editar").toggleClass('hi');
      $$("#excluir").toggleClass('hi');
      myApp.hidePreloader();
    },500);
}

function editar_endereco()
{
    myApp.showPreloader();
    setTimeout(function () {
      var json_dados = ajax_method(false,'endereco.update',document.getElementById('id').value,document.getElementById('rua').value,document.getElementById('numero').value,document.getElementById('complemento').value,document.getElementById('cep').value,document.getElementById('bairro').value,document.getElementById('estado').value,document.getElementById('cidade').value,document.getElementById('pais').value,document.getElementById('lat').value,document.getElementById('long').value);
      if (json_dados)
      {
         mainView.router.back();
         carregar_enderecos();
      }
      else
        myApp.alert("Não foi possível editar seu endereço, por favor, reveja sua conexão ou dados.")
      myApp.hidePreloader();
    },500);
}

function excluir_endereco(id)
{
  myApp.showPreloader();
  setTimeout(function () {
    var json_dados = ajax_method(false,'endereco.delete',id);
    if (!json_dados)
    {
      myApp.alert("Não foi possível excluir seu endereço. Por favor, reveja sua conexão.");
    }
    else
    {
      myApp.hidePreloader();
      carregar_enderecos();
    }
  },500);
}

function excluir_notificacao(id)
{
    setTimeout(function () {
      var json_dados = ajax_method(false,'notificacao.delete',id);
      if (json_dados) {
      }
      else{
        myApp.alert("Não foi possível excluir sua notificação, por favor, reveja sua conexão.");
      }
    },500);
}

function obter_select(select) {
  var resultado = [];
  var options = select && select.options;
  var opt;

  for (var i=0, iLen=options.length; i<iLen; i++) {
    opt = options[i];

    if (opt.selected) {
      resultado[i] = opt.value;
    }
  }
  return resultado;
}
