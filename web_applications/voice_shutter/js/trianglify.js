// Please see
// https://hacknote.jp/archives/26679/

function addTriangleTo(target) {
    var dimensions = target.getClientRects()[0];
    var pattern = Trianglify({
        width: dimensions.width,
        height: dimensions.height + 1000,
        cell_size: 75,
        x_colors: 'GnBu',
        palette: Trianglify.colorbrewer,
        variance: 0.4
    });
    target.style['background-image'] = 'url(' + pattern.png() + ')';
}
