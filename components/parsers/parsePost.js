'use strict';

/**
 * Obtener los datos de cada post.
 * @param {Cheerio} post
 * @param {Cheerio} $
 * @return {Object} data
 */

function postMeta(post, $) {
    let data = {};
    // ID de posteo
    data.postId = parseInt(post.find('.reflink').first().find('a').last().text().trim());
    // Nombre del posteador (en boards con campo de nombre)
    data.posterName = post.find("span.postername").first().text().trim();
        
    // Bandera
    if (post.find(".bandera").length > 0) {
        let bandera = post.find(".bandera").first();
        data.posterCountry = bandera.attr("alt");
        data.posterCountryName = bandera.attr("title");
        data.flag = bandera.attr("src");
    }
        
    // Fecha y Hora
    let dateRe    = /(\d{1,2})\/(\d{1,2})\/(\d{1,2}) (\d{1,2}):(\d{1,2})/;
    //let dateParts = post.find('[title*="Horario"]').first().text().trim().match(dateRe);
    //Nueva forma de buscar la fecha en hispachanGold
    let daf =post.find('span.timer').first()[0].children[0].attribs;
    let key =Object.keys(daf);
    let dateParts = daf[key[1]].trim().match(dateRe);
    let date      = new Date(Date.UTC(
        parseInt('20' + dateParts[3]),
        parseInt(dateParts[2]) -1,
        parseInt(dateParts[1]),
        parseInt(dateParts[4]),
        parseInt(dateParts[5])
    ));
//let date      = new Date("11/20/2014 04:11");
    data.date = date;
    
    // Nuevo dado [Abril 2016]
    let dC = post.find('blockquote').first().find('span.dado');
    if(dC.length > 0)
    {
        data.dado = dC.find('b').text();
        dC.remove();
    }

    // Fortunas [Julio 2016]
    let fort = post.find('blockquote').first().find('font[color="red"]')
    if(fort.length > 0)
    {
        let fortxt = fort.find('b').text();
        if(fortxt.substr(0, 11) == 'Tu fortuna:')
        {
            data.fortuna = fortxt.substr(11).trim();
            fort.remove();
        }
    }
    // Mensaje
    let html = post.find('blockquote').first().html();
    // Convertir HTML a BBCode de Hispa
    /*
    html = html.replace(/<div class="code(.*?)">(.*?)<\/div>/gmi, "[code]$2[/code]"); // [code]
    html = html.replace(/<b(.*?)>(.*?)<\/b>/gmi, "[b]$2[/b]"); // [b]
	html = html.replace(/<i(.*?)>(.*?)<\/i>/gmi, "[i]$2[/i]"); // [i]
    html = html.replace(/<span style="border-bottom(.*?)">(.*?)<\/b>/gmi, "[u]$2[/u]"); // [u] (que mierda zeta?)
    html = html.replace(/<strike(.*?)>(.*?)<\/strike>/gmi, "[s]$2[/s]"); // [s]
    html = html.replace(/<span class="spoiler(.*?)">(.*?)<\/spoiler>/gmi, "[spoiler]$2[/spoiler]"); // [spoiler]*/
    /*codigo de CuloArdido*/
    html = html.replace(/<div class="code([^"]*)">([\s\S]*?)<\/div>/gmi, "[code]$2[/code]"); // [code]
    html = html.replace(/<b([^r>]*)>([\s\S]*?)<\/b>/gmi, "[b]$2[/b]"); // [b] evitando <br>
    html = html.replace(/<i([^>]*)>([\s\S]*?)<\/i>/gmi, "[i]$2[/i]"); // [i]
    html = html.replace(/<span style="border-bottom([^"]+)">([\s\S]*?)<\/span>/gmi, "[u]$2[/u]"); // [u] (que mierda zeta?)
    html = html.replace(/<strike([^>]*)>([\s\S]*?)<\/strike>/gmi, "[s]$2[/s]"); // [s]
    html = html.replace(/<span[^>]+class="spoiler(.*?)"[^>]*>([\s\S]*?)<\/span>/gmi, "[spoiler]$2[/spoiler]"); // [spoiler]
    html = html.replace(/<a id="embed(.*?)">(.*?)<\/a>/gmi, ""); // [Reproducir]
    post.find('blockquote').first().html(html); 
    post.find('.abbrev').first().remove();
    data.message = post.find('blockquote').first().text().trim().replace(/(\r\n|\r)/gm, "\n");
    
    // Archivo
    if (post.children('.filesize').length >= 1 || post.find('.activa').children('.filesize').length >= 1) {
        let fileInfo = post.find('.filesize').first();
        let fileMeta = fileInfo.children('span[style^="font-size"]').first();
        let fileMetaR = fileMeta.text().replace(/(\r\n|\n|\r|[()])/gm, "").split(',');
        let fileSize = fileMetaR[0].trim();
        let fileRes = (fileMetaR.length > 1) ? fileMetaR[1].trim() : '';
        let fileON = (fileMetaR.length > 2) ? fileMetaR[2].trim() : fileInfo.find('a').first().attr('href').split('/').reverse()[0];
        if (fileMetaR.length == 2) fileON = fileMetaR[1].trim();
        data.file = {
            url: fileInfo.find('a').first().attr('href'),
            size: fileSize,
            resolution: fileRes,
            name: fileON,
            thumb: post.find('img.thumb').first().attr('src')
        };
    }
    
    return data;
}

module.exports = postMeta;