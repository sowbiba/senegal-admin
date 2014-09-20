;
(function ($) {
    $(document).ready(function () {
        if ($(".sf-toolbar").length > 0) {
            var listener = new window.keypress.Listener();

            initModal();
            initDevGift(listener);
        }
    });

    function initModal() {
        $("body").append('<div class="modal fade" id="devGift" tabindex="-1" role="dialog" aria-labelledby="myModalLabel" aria-hidden="true"><div class="modal-dialog modal-lg"><div class="modal-content"></div></div></div>');
        // create Nodes
        var modalHeader = $('<div/>').addClass('modal-header')
                .append('<h4/>')
                .addClass('modal-title')
                .html('<button type="button" class="close" data-dismiss="modal" aria-hidden="true">&times;</button><h3 id="myModalLabel"></h3>'),
            modalBody = $('<div/>').addClass('modal-body')
                .html('<p style="font-size:24px; text-align:center;"><i class="fa fa-spinner fa-3 fa-spin"></i>&nbsp;&nbsp;&nbsp;Chargement...</p>'),
            modalFooter = $('<div/>').addClass('modal-footer')
                .append('<p/>')
                .html('&nbsp;');
        // clean current & append correct nodes
        $('#devGift').find('.modal-content')
            .empty()
            .append(modalHeader, modalBody, modalFooter);
    }


    function initDevGift(listener) {
        $('input[type=text]')
            .bind("focus", listener.stop_listening)
            .bind("blur", listener.listen);
        var my_scope = this,
            modal = $('#devGift'),
            my_combos = listener.register_many([
                {
                    "keys": "p r o u t",
                    "is_sequence": true,
                    "is_exclusive": true,
                    "on_keydown": function () {
                        modal.find('.modal-header #myModalLabel').html('Ho shit !');
                        modal.find('.modal-body').html('<img src="/bundles/pfdlayout/img/unko.png"/>');
                    },
                    "on_keyup": function (e) {
                        modal.modal('show');
                    },
                    "this": my_scope
                },

            ]);


    }

})(jQuery);