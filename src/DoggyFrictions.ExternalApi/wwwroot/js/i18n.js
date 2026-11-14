// Interface texts. The page embeds window.AppTexts (key -> text in the current language) and
// window.AppLanguage; the server keeps the catalog in Localization/*.json.

// T('key') returns the text; T('key', a, b) also fills its {0}, {1}… placeholders.
// The result is plain text: escape arguments yourself before inserting it as HTML.
window.T = function (key) {
    var text = (window.AppTexts || {})[key];
    if (text === undefined) {
        return key;
    }
    var args = arguments;
    return text.replace(/\{(\d+)\}/g, function (placeholder, index) {
        var value = args[Number(index) + 1];
        return value === undefined ? placeholder : value;
    });
};

// Settings menu: the choice is kept in a cookie, which the server reads to pick the texts.
$(document).on('click', '[data-language]', function () {
    document.cookie = 'lang=' + $(this).attr('data-language') + '; path=/; max-age=31536000; samesite=lax';
    window.location.reload();
});
