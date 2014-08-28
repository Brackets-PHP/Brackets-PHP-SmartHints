/**
 * @file jQuery Plugin: jquery.add-input-area
 * @version 4.7.1
 * @author Yuusaku Miyazaki [toumin.m7@gmail.com]
 * @license MIT License
 */
(function($) {

/**
 * @desc プラグインをjQueryのプロトタイプに追加する
 * @global
 * @memberof jQuery
 * @param {Object} [option] オプションを格納した連想配列
 * @param {string} [option.attr_name] - 増減する要素のid属性の命名規則
 * @param {string} [option.area_var] - 増減する要素に共通するCSSクラス名
 * @param {string} [option.area_del] - 削除ボタンとともに表示・非表示が切り替わる削除エリアに共通するCSSクラス名。
 * @param {string} [option.btn_del] - 削除ボタンに共通するCSSクラス名
 * @param {string} [option.btn_add] - 追加ボタンに共通するCSSクラス名
 * @param {Function} [option.after_add] - 追加後に実行する関数
 * @param {number} [option.maximum] - 最大増加数
 */
$.fn.addInputArea = function(option) {
	return this.each(function() {
		new AddInputArea(this, option);
	});
};

/**
 * @global
 * @constructor
 * @classdesc 要素ごとに適用される処理を集めたクラス
 * @param {Object} elem - プラグインを適用するHTML要素
 * @param {Object} option - オプションを格納した連想配列
 *
 * @prop {Object} elem - プラグインを適用するHTML要素
 * @prop {Object} option - オプションを格納した連想配列
 */
function AddInputArea(elem, option) {
	this.elem = elem;
	this.option = option;

	this._setOption();
	this._setDelBtnVisibility();
	this._ehAddBtn();
	this._ehDelBtn();
	this._setNameAttribute();
	this._saveOriginal();
}

$.extend(AddInputArea.prototype, /** @lends AddInputArea.prototype */ {
	/**
	 * @private
	 * @desc オプションの初期化
	 */
	_setOption: function() {
		var id = $(this.elem).attr('id');
		this.option =  $.extend({
			attr_name : (id) ? id  + '_%d'       : 'aia_%d',
			area_var  : (id) ? '.' + id + '_var' : '.aia_var',
			area_del  : '',
			btn_del   : (id) ? '.' + id + '_del' : '.aia_del',
			btn_add   : (id) ? '.' + id + '_add' : '.aia_add',
			after_add : null,
			maximum   : 0
		}, this.option);
		if (!this.option.area_del) this.option.area_del = this.option.btn_del;
	},

	/**
	 * @private
	 * @desc 削除ボタンの表示状態を決定する。<br>
	 * 増減する項目がひとつなら、削除ボタンは表示しない。
	 */
	_setDelBtnVisibility: function() {
		if ($(this.elem).find(this.option.area_var).length == 1) {
			$(this.elem).find(this.option.area_del).hide();
		}
	},

	/**
	 * @private
	 * @desc 追加ボタンのイベントハンドラ
	 */
	_ehAddBtn: function() {
		var self = this;
		$(document).on('click', this.option.btn_add, function(ev) {
			// 品目入力欄を追加
			var len_list = $(self.elem).find(self.option.area_var).length;
			var new_list = $(self.option.original).clone(true);

			$(new_list)
				.find('[name]').each(function(idx, obj) {
					// name, id属性を変更
					self._changeAttrAlongFormat(obj, len_list, 'name');
					self._changeAttrAlongFormat(obj, len_list, 'id');

					// val, textを空にする。
					if ($(obj).attr('empty_val') != 'false') {
						if (
							$(obj).attr('type') == 'checkbox' ||
							$(obj).attr('type') == 'radio'
						) {
							obj.checked = false;
						} else if (
							$(obj).attr('type') != 'submit' &&
							$(obj).attr('type') != 'reset'  &&
							$(obj).attr('type') != 'image'  &&
							$(obj).attr('type') != 'button'
						) {
							$(obj).val('');
						}
					}
				}).end()
				.find('[for]').each(function(idx, obj) {
					// for属性を変更
					self._changeAttrAlongFormat(obj, len_list, 'for');
				});

			$(self.elem).append(new_list);
			// 入力欄が2つ以上になるので、削除ボタンを表示する
			$(self.elem).find(self.option.area_del).show();

			// 追加上限
			if (
				self.option.maximum > 0 &&
				$(self.elem).find(self.option.area_var).length >= self.option.maximum
			) {
				$(self.option.btn_add).hide();
			}
			// 追加後の処理があれば実行する
			if (typeof self.option.after_add == 'function') self.option.after_add();
		});
	},

	/**
	 * @private
	 * @desc 削除ボタンのイベントハンドラ
	 */
	_ehDelBtn: function() {
		var self = this;
		$(self.elem).on('click', self.option.btn_del, function(ev) {
			ev.preventDefault();
			//品目入力欄を削除
			var idx = $(self.elem).find(self.option.btn_del).index(ev.target);
			$(self.elem).find(self.option.area_var).eq(idx).remove();

			// 削除ボタンの表示状態を決定する
			self._setDelBtnVisibility();

			// 入力欄の番号を振り直す
			self._setNameAttribute();

			// 追加上限
			if (
				self.option.maximum > 0 &&
				$(self.elem).find(self.option.area_var).length < self.option.maximum
			) {
				$(self.option.btn_add).show();
			}
		});
	},

	/**
	 * @private
	 * @desc 増減項目のid,name,for属性の番号を一括して振り直す
	 */
	_setNameAttribute: function() {
		var self = this;
		$(this.elem).find(this.option.area_var).each(function(idx, obj) {
			$(obj)
				.find('[name]').each(function() {
					// name, id属性を変更
					self._changeAttrAlongFormat(this, idx, 'name');
					self._changeAttrAlongFormat(this, idx, 'id');
				}).end()
				.find('[for]').each(function() {
					// for属性を変更
					self._changeAttrAlongFormat(this, idx, 'for');
				});
		});
	},

	/**
	 * @private
	 * @desc クローン元を保管する
	 */
	_saveOriginal: function() {
		this.option.original = $(this.elem).find(this.option.area_var).eq(0).clone(true);
	},

	/**
	 * @private
	 * @desc 入力欄の番号を振り直す
	 * @param {Object} obj - 番号を変更すべき項目を持つHTML要素
	 * @param {number} idx - 変更する値
	 * @param {string} type - 属性の名前 (e.g.: id, name, for)
	 */
	_changeAttrAlongFormat: function(obj, idx, type) {
		var changed = null;
		if (/^.+_\d+$/.test($(obj).attr(type))) {
			changed =  $(obj).attr(type).replace(/^(.+_)\d+$/, '$1' + idx);
		} else {
			// 命名規則に従っていないのに"name_format"や"id_format"を設定していないと例外を投げる
			try {
				switch (type) {
					case 'name':
						if ($(obj).attr('name_format')) {
							changed = $(obj).attr('name_format').replace('%d', idx);
						} else {
							throw new Error(
								'(jquery.addInputArea)\n' +
								'Not found "name_format" attribute in\n' +
								'<' + $(obj)[0].tagName + ' ' + type + '="' + $(obj).attr(type) + '">'
							);
						}
						break;

					case 'id':
						if ($(obj).attr('id_format')) {
							changed = $(obj).attr('id_format').replace('%d', idx);
						} else if ($(obj).attr('id')) { // そもそもid属性が存在しない場合を除く
							throw new Error(
								'(jquery.addInputArea)\n' +
								'Not found "name_format" attribute in\n' +
								'<' + $(obj)[0].tagName + ' ' + type + '="' + $(obj).attr(type) + '">'
							);
						}
						break;

					case 'for':
						if ($(obj).attr('id_format')) {
							changed = $(obj).attr('id_format').replace('%d', idx);
						} else {
							throw new Error(
								'(jquery.addInputArea)\n' +
								'Not found "name_format" attribute in\n' +
								'<' + $(obj)[0].tagName + ' ' + type + '="' + $(obj).attr(type) + '">'
							);
						}
						break;
				}
			} catch(e) {
				alert(e);
			}
		}
		$(obj).attr(type, changed);
	}
}); // end of "$.extend"

})( /** namespace */ jQuery);
