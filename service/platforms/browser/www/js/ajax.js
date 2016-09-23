var xhrTimeout=1000;
var url='http://descartes.esy.es/';
var urn = 'urn:descartes';
var empresa_id = 0;
var markerCluster;

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
      remover_panel();
      if(localStorage.getItem("login_id") != null)
        mainView.router.loadPage('mapa.html');
    }

    if(page.name === 'addendereco')
    {
      if (page.query.id) {
        carregar_edicao_endereco(page.query.id,page.query.nome);
      }
    }

    if(page.name == 'mapa')
    {
      criar_menu();
      inicializar_map();
      mapa_refresh();
    }

    if(page.name == 'perfil')
    {
      criar_menu();
      carregar_perfil();
    }

    if(page.name == 'enderecos')
    {
      criar_menu();
      carregar_enderecos();
    }

    if(page.name == 'agendamentos')
    {
      criar_menu();
      carregar_agendamentos();
    }
    if(page.name == 'agendar')
    {
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
  if(localStorage.getItem("login_id") == null)
  {
    remover_panel();
    mainView.router.loadPage('login.html');
  }
  else
  {
    criar_menu();
    mainView.router.loadPage('mapa.html');
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
    for(var i=0;i<agendamento.length;i++)
    {
      json_dados = ajax_method(false,'empresa.select_by_id',agendamento[i].empresa_id);
      var empresa = JSON.parse(json_dados);
      json_dados = ajax_method(false,'usuario_has_endereco.select',"endereco_id = "+agendamento[i].endereco_id+" AND usuario_id = "+localStorage.getItem("login_id"));
      var usuario_has_endereco = JSON.parse(json_dados);
      var data = new Date(agendamento[i].data_agendamento);
      var hoje = new Date;
      var html = '<li class="accordion-item swipeout" id="li_id_'+agendamento[i].id+'"><a href="#" class="item-content swipeout-content item-link">'+
                '<div class="item-inner" >'+
                  '<div class="item-title"><i class="fa fa-arrow-right"></i>   '+empresa[0].nome_fantasia+' - '+usuario_has_endereco[0].nome+'</div>'+
                    '</div></a>'+
                      '<div class="accordion-item-content swipeout-content" style="background-color:#EDEDED;"><div class="content-block">'+
                          '<p>Data agendada: '+agendamento[i].data_agendamento+'</p>'+
                          '<p>Horário: '+agendamento[i].horario+'</p>';
      json_dados = ajax_method(false,'agendamento_has_tipo_lixo.select_by_agendamento',agendamento[i].id);
      var agendamento_has_tipo_lixo = JSON.parse(json_dados);
      var tipos_lixo = "";
      for(var j=0;j<agendamento_has_tipo_lixo.length;j++)
      {
        json_dados = ajax_method(false,'tipo_lixo.select_by_id',agendamento_has_tipo_lixo[j].tipo_lixo_id);
        var tipo_lixo = JSON.parse(json_dados);
        if(j!=0)
          tipos_lixo += ', ';
        tipos_lixo += tipo_lixo[0].nome;
      }
      if(agendamento_has_tipo_lixo.length > 0)
        html += '<p>Quantidade média (em Kg): '+agendamento_has_tipo_lixo[0].quantidade+'</p>';
      html += '<p>Tipos de lixo: '+tipos_lixo+'</p>';
      btn = '<p><a onclick="cancelar_agendamento('+agendamento[i].id+')" style="width:90%;margin-left:5%;" class="button button-raised button-fill color-red swipeout-delete">Cancelar Agendamento</a><p>';
      if((agendamento[i].aceito == 0) && (agendamento[i].realizado == 0))
        document.getElementById('espera').innerHTML += html+btn+'</div></div></li>';
      else if((agendamento[i].aceito == 1) && (agendamento[i].realizado == 0) && (data < hoje))
        document.getElementById('atrasados').innerHTML += html+btn+'</div></div></li>';
      else if((agendamento[i].aceito == 1) && (agendamento[i].realizado == 0))
        document.getElementById('aceitos').innerHTML += html+btn+'</div></div></li>';
      else if((agendamento[i].aceito == 1) && (agendamento[i].realizado == 1) && (data >= hoje))
        document.getElementById('realizados').innerHTML += html+'</div></div></li>';
    }
    myApp.hidePreloader();
  },500);
}

function cancelar_agendamento(id)
{
  var cancelador = ajax_method(false,'agendamento.cancelar',id);
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
        myApp.alert("Seu endereco não pode ser criado, reveja suas informações ou sua conexão por favor.");
      }
    }
    else
      myApp.alert("Seu endereco não pode ser criado, reveja suas informações ou sua conexão por favor.");
    myApp.hidePreloader();
    mainView.router.loadPage('enderecos.html');
  },500);

}

function carregar_enderecos()
{
  myApp.showPreloader();
  setTimeout(function () {
    var json_dados = ajax_method(false,'usuario_has_endereco.select','usuario_id = '+localStorage.getItem("login_id"));
    var retorno = JSON.parse(json_dados);
    html = '';
    for (i = 0; i < retorno.length; i++)
    {
      json_dados = ajax_method(false,'endereco.select_by_id',retorno[i].endereco_id);
      var endereco = JSON.parse(json_dados);
      html += '<li class="accordion-item swipeout"><a href="#" class="item-content swipeout-content item-link">'+
                '<div class="item-inner" >'+
                  '<div class="item-title">';
      if (localStorage.getItem("lat_padrao")==endereco[0].latitude && localStorage.getItem("long_padrao")==endereco[0].longitude)
        html+='<i class="fa fa-star">';
      else
        html+='<i class="fa fa-university">';

      botaum = "seleciona("+endereco[0].latitude+","+endereco[0].longitude+");"; 

      html+='</i>   '+retorno[i].nome+'</div>'+
                    '</div></a>'+
                      '<div class="accordion-item-content swipeout-content" style="background-color:#EDEDED;"><div class="content-block">'+
                          '<p>Rua: '+endereco[0].rua+'</p>'+
                          '<p>Número: '+endereco[0].num+'. Complemento: '+endereco[0].complemento+'</p>'+
                          '<p>CEP:'+endereco[0].cep+'</p>'+
                          '<p>Cidade: '+endereco[0].cidade+'. Bairro: '+endereco[0].bairro+'</p>'+
                          '<p>UF: '+endereco[0].uf+'. País: '+endereco[0].pais+'</p>';
      if (localStorage.getItem("lat_padrao")!=endereco[0].latitude && localStorage.getItem("long_padrao")!=endereco[0].longitude)
        html += '<p><a onclick="'+botaum+'" style="width:90%;margin-left:5%;" class="button button-raised button-fill color-green">Definir como principal</a><p>';
      html += '</div></div>'+
              '<div class="swipeout-actions-left "><a href="addendereco.html?id='+retorno[i].endereco_id+'&nome='+retorno[i].nome+'" class="action1 bg-orange">Editar</a></div>'+
              '<div class="swipeout-actions-right "><a onclick="excluir_endereco('+retorno[i].endereco_id+')" class="swipeout-delete bg-red">Excluir</a></div>'+
              '</li>';
    }
    document.getElementById('ulenderecos').innerHTML = html;
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
  var panel_html = '<li><a href="mapa.html" class="item-link">'+
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
                            '<div class="item-title">Enderecos</div>'+
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

function remover_panel()
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
      myApp.alert('Login realizado com sucesso!',function (){
        mainView.router.loadPage('mapa.html');
      });
    }
    else
    {
      myApp.alert('Email ou senha não correspondem!');
    }
    myApp.hidePreloader();
  },100);
}

function logout()
{
  remover_panel();
  localStorage.removeItem("login_id");  
  mainView.router.loadPage('login.html');
}

function select_pontos()
{
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

  json_dados = ajax_method(false,'ponto.select','');
  var ponto = JSON.parse(json_dados);

  setMapOnAll(null);
  markers = [];

  for(var i=0;i<ponto.length;i++)
  {
    var condi = "ponto_id = "+ponto[i].id+" AND ("+condicao+")";
    if(num == 0)
      condi = '';
    json_dados = ajax_method(false,'tipo_lixo_has_ponto.select',condi);
    tipo_lixo_has_ponto = JSON.parse(json_dados);
    if(tipo_lixo_has_ponto.length > 0)
    {
      json_dados = ajax_method(false,'endereco.select_by_id',ponto[i].endereco_id);
      var endereco = JSON.parse(json_dados);
      var features = [];
      features["type"] = "mark1";
      features["position"] = new google.maps.LatLng(endereco[0].latitude,endereco[0].longitude);
      features["info"] = '<div class="list-block cards-list">'+
                           '<ul>'+
                             '<li class="card">'+
                               '<div class="card-header">Nome do ponto</div>'+
                               '<div class="card-content">'+
                                 '<div class="card-content-inner">Descrição do ponto</div>'+
                               '</div>'+
                               '<div class="card-footer">'+
                               '<div class="content-block"><p class="buttons-row">'+
                                 '<a href="agendar.html" onclick="empresa_id='+ponto[i].empresa_id+';" style="width:100%" class="button button-raised button-fill color-green">Agende sua coleta</a>'+
                               '</p><p class="buttons-row">'+
                                 '<a href="#" style="width:100%" class="button button-raised button-fill color-blue" onclick ="calculateAndDisplayRoute'+
                                 '('+endereco[0].latitude+','+endereco[0].longitude+')">Rotas até aqui</a>'+
                               '</p></div></div>'+
                             '</li>'+
                           '</ul>'+
                         '</div>';
      features["draggable"] = false;
      addMarker(features);
    }
  }
  markerCluster = new MarkerClusterer(map, markers, options); 
}

function mostrar_enderecos()
{
  var json_dados = ajax_method(false,'usuario_has_endereco.select','usuario_id = '+localStorage.getItem("login_id"));
  var usuario_has_endereco = JSON.parse(json_dados);
  var html = "";

  for(var i=0;i<usuario_has_endereco.length;i++)
  {
    html += '<option value='+usuario_has_endereco[i].endereco_id;
    if(i==0)
      html += ' selected';
    html += '>'+usuario_has_endereco[i].nome+'</option>';
  }
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
  var component = document.getElementById("popover-list");
  var html = '<ul>'+
                '<li>'+
                    '<div class="item-content"> '+
                      '<div class="item-inner">'+
                        '<div class="item-title" style="font-size:18px;">Filtros</div>'+
                      '</div>'
                    '</div>'+
                  '</li>';

  var json_dados = ajax_method(false,'tipo_lixo.select','');
  var tipo_lixo = JSON.parse(json_dados);

  for(var i=0;i<tipo_lixo.length;i++)
    html += '<li>'+
              '<label class="label-checkbox item-content">'+
                '<input type="checkbox" id="tipo_lixo_'+tipo_lixo[i].id+'"  name="tipo_lixo_'+tipo_lixo[i].id+'" value="'+tipo_lixo[i].id+'" checked="false">'+
                '<div class="item-media">'+
                  '<i class="icon icon-form-checkbox"></i>'+
                '</div>'+
                '<div class="item-inner">'+
                  '<div class="item-title">'+tipo_lixo[i].nome+'</div>'+
                '</div>'+
              '</label>'+
            '</li>';
  html +=   '<li>'+
              '<label class="label-checkbox item-content">'+
                '<a onclick="aplicar_filtro();" style="width:100%;margin-right:15px;" class="button button-raised button-fill color-bluegray">Aplicar filtros</a>'+
              '</label>'+
            '</li>'+
          '</ul>';
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
  myApp.showPreloader();
  setTimeout(function () {
    var adduser = ajax_method(false,'usuario.insert',document.getElementById("cad_nome").value,document.getElementById("cad_email").value,document.getElementById("cad_senha").value,document.getElementById("cad_cpf").value,document.getElementById("cad_telefone").value);
    if(adduser != 0)
    {
      myApp.hidePreloader();
      localStorage.setItem("login_id",adduser);
      mainView.router.loadPage('mapa.html');
    }
    else
    {
      myApp.hidePreloader();
      myApp.alert("Seu perfil não pode ser criado, reveja suas informações ou sua conexão por favor.");
    }
  },500);

}

function seleciona (lat,long)
{
  localStorage.setItem('lat_padrao',lat);
  localStorage.setItem('long_padrao',long);
  mainView.router.refreshPage();
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
      if (json_dados) {
         myApp.hidePreloader();
         mainView.router.loadPage('enderecos.html');
      }
      else{
        myApp.hidePreloader();
        myApp.alert("Não foi possível editar seu endereço, por favor, reveja sua conexão ou dados.")
      }
    },500);
}

function excluir_endereco(id)
{
    setTimeout(function () {
      var json_dados = ajax_method(false,'endereco.delete',id);
      if (json_dados) {
      }
      else{
        myApp.alert("Não foi possível excluir seu endereço, por favor, reveja sua conexão.");
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
