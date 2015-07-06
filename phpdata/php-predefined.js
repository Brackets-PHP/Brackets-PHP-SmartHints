/*The MIT License (MIT)

Copyright (c) 2014 Andrew MacKenzie

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.*/

/*jslint vars: true, plusplus: true, devel: true, nomen: true, indent: 4, maxerr: 50 */
/*global require, define, brackets */

define(function (require, exports, module) {
    "use strict";

    var strPredefinedFunctions = [
        "abs|acos|acosh|addcslashes|addslashes|aggregate|aggregate_info|aggregate_methods|aggregate_methods_by_list|aggregate_methods_by_regexp|",
        "aggregate_properties|aggregate_properties_by_list|aggregate_properties_by_regexp|aggregation_info|amqpconnection|amqpexchange|amqpqueue|",
        "appenditerator|array_change_key_case|array_chunk|array_combine|",
        "array_count_values|array_diff|array_diff_assoc|array_diff_key|array_diff_uassoc|array_diff_ukey|array_fill|array_fill_keys|array_filter|",
        "array_flip|array_intersect|array_intersect_assoc|array_intersect_key|array_intersect_uassoc|array_intersect_ukey|array_key_exists|",
        "array_keys|array_map|array_merge|array_merge_recursive|array_multisort|array_pad|array_pop|array_product|array_push|array_rand|",
        "array_reduce|array_replace|array_replace_recursive|array_reverse|array_search|array_shift|array_slice|array_splice|array_sum|array_udiff|",
        "array_udiff_assoc|array_udiff_uassoc|array_uintersect|array_uintersect_assoc|array_uintersect_uassoc|array_unique|array_unshift|",
        "array_values|array_walk|array_walk_recursive|arrayaccess|arrayiterator|arrayobject|arsort|asin|asinh|asort|assert|assert_options|atan|",
        "atan2|atanh|audioproperties|badfunctioncallexception|badmethodcallexception|base64_decode|base64_encode|base_convert|basename|",
        "bin2hex|bindec|",
        "bumpValue|",
        "cachingiterator|call_user_func|call_user_func_array|call_user_method|call_user_method_array|callbackfilteriterator|ceil|",
        "chdb|chdb_create|chdir|checkdate|checkdnsrr|chgrp|chmod|chop|chown|chr|chroot|chunk_split|class_alias|class_exists|class_implements|",
        "class_parents|clearstatcache|closedir|closelog|collator|com|compact|connection_aborted|connection_status|connection_timeout|constant|construct|construct|construct|",
        "convert_cyr_string|convert_uudecode|convert_uuencode|copy|cos|cosh|count|count_chars|countable|counter_bump|counter_bump_value|",
        "counter_create|counter_get|counter_get_meta|counter_get_named|counter_get_value|counter_reset|counter_reset_value|",
        "crc32|create_function|crypt|current|date|date_add|date_create|",
        "date_create_from_format|date_date_set|date_default_timezone_get|date_default_timezone_set|date_diff|date_format|date_get_last_errors|",
        "date_interval_create_from_date_string|date_interval_format|date_isodate_set|date_modify|date_offset_get|date_parse|date_parse_from_format|",
        "date_sub|date_sun_info|date_sunrise|date_sunset|date_time_set|date_timestamp_get|date_timestamp_set|date_timezone_get|date_timezone_set|",
        "dateinterval|dateperiod|datetime|datetimezone|deaggregate|debug_backtrace|debug_print_backtrace|debug_zval_dump|decbin|dechex|decoct|define|",
        "define_syslog_variables|defined|deg2rad|delete|dir|directoryiterator|dirname|disk_free_space|disk_total_space|diskfreespace|dl|dns_check_record|",
        "dns_get_mx|dns_get_record|doubleval|each|emptyiterator|",
        "end|ereg|ereg_replace|eregi|",
        "eregi_replace|error_get_last|error_log|error_reporting|errorexception|escapeshellarg|escapeshellcmd|exception|exec|exp|explode|",
        "expm1|export|export|extension_loaded|extract|ezmlm_hash|fclose|feof|fflush|fgetc|fgetcsv|fgets|fgetss|file|",
        "file_exists|file_get_contents|file_put_contents|fileatime|filectime|filegroup|fileinode|filemtime|fileowner|fileperms|",
        "filesize|filesystemiterator|",
        "filetype|filteriterator|finfo_buffer|",
        "finfo_close|finfo_file|finfo_open|finfo_set_flags|floatval|flock|floor|fmod|fnmatch|fopen|forward_static_call|",
        "forward_static_call_array|fpassthru|fprintf|fputcsv|fputs|fread|fribidi_log2vis|fscanf|fseek|fsockopen|fstat|ftell|",
        "ftruncate|func_get_arg|func_get_args|",
        "func_num_args|function_exists|fwrite|gc_collect_cycles|gc_disable|gc_enable|gc_enabled|getMeta|getNamed|getValue|",
        "get_browser|get_called_class|get_cfg_var|get_class|get_class_methods|get_class_vars|get_current_user|get_declared_classes|",
        "get_declared_interfaces|get_defined_constants|get_defined_functions|get_defined_vars|get_extension_funcs|get_headers|",
        "get_html_translation_table|get_include_path|get_included_files|get_loaded_extensions|get_magic_quotes_gpc|get_magic_quotes_runtime|",
        "get_meta_tags|get_object_vars|get_parent_class|get_required_files|get_resource_type|getallheaders|getconstant|getconstants|getconstructor|",
        "getcwd|getdate|getdefaultproperties|getdoccomment|getendline|getenv|getextension|getextensionname|getfilename|gethostbyaddr|gethostbyname|",
        "gethostbynamel|gethostname|getinterfacenames|getinterfaces|getlastmod|getmethod|getmethods|getmodifiers|getmxrr|getmygid|",
        "getmyinode|getmypid|getmyuid|getname|getnamespacename|getopt|getparentclass|getproperties|getproperty|getprotobyname|getprotobynumber|",
        "getrandmax|getrusage|getservbyname|getservbyport|getshortname|getstartline|getstaticproperties|getstaticpropertyvalue|",
        "gettimeofday|gettype|glob|globiterator|gmdate|gmmktime|gmstrftime|",
        "gopher_parsedir|",
        "halt_compiler|hasconstant|hasmethod|hasproperty|header|",
        "header_register_callback|header_remove|headers_list|headers_sent|hebrev|hebrevc|hex2bin|hexdec|highlight_file|highlight_string|",
        "html_entity_decode|htmlentities|htmlspecialchars|htmlspecialchars_decode|",
        "ignore_user_abort|implementsinterface|implode|import_request_variables|in_array|",
        "inclued_get_data|inet_ntop|inet_pton|infiniteiterator|ini_alter|ini_get|ini_get_all|ini_restore|ini_set|innamespace|interface_exists|",
        "intldateformatter|intval|invalidargumentexception|invoke|invokeargs|ip2long|is_a|is_array|is_bool|is_callable|is_dir|",
        "is_double|is_executable|is_file|is_finite|is_float|is_infinite|is_int|is_integer|is_link|is_long|is_nan|is_null|is_numeric|is_object|",
        "is_readable|is_real|is_resource|is_scalar|is_soap_fault|is_string|is_subclass_of|is_uploaded_file|is_writable|is_writeable|isabstract|",
        "iscloneable|isdisabled|isfinal|isinstance|isinstantiable|isinterface|isinternal|isiterateable|issubclassof|isuserdefined|iterator|",
        "iterator_apply|iterator_count|iterator_to_array|iteratoraggregate|iteratoriterator|java_last_exception_clear|java_last_exception_get|",
        "json_decode|json_encode|",
        "json_last_error|jsonserializable|key|krsort|ksort|lcfirst|lcg_value|lchgrp|lchown|lengthexception|levenshtein|",
        "limititerator|link|linkinfo|list|locale|localeconv|localtime|log|log10|log1p|logicexception|long2ip|lstat|ltrim|", "magic_quotes_runtime|mail|",
        "main|max|",
        "md5|md5_file|",
        "mdecrypt_generic|memory_get_peak_usage|memory_get_usage|messageformatter|metaphone|method_exists|microtime|mime_content_type|min|ming_keypress|",
        "ming_setcubicthreshold|ming_setscale|ming_setswfcompression|ming_useconstants|ming_useswfversion|mkdir|mktime|money_format|move_uploaded_file|mpegfile|",
        "mt_getrandmax|mt_rand|mt_srand|multipleiterator|natcasesort|natsort|",
        "next|nl2br|nl_langinfo|norewinditerator|normalizer|number_format|",
        "numberformatter|",
        "octdec|opendir|openlog|ord|outeriterator|outofboundsexception|outofrangeexception|overflowexception|overload|override_function|",
        "ovrimos_close|ovrimos_commit|ovrimos_connect|ovrimos_cursor|ovrimos_exec|ovrimos_execute|ovrimos_fetch_into|ovrimos_fetch_row|",
        "ovrimos_field_len|ovrimos_field_name|ovrimos_field_num|ovrimos_field_type|ovrimos_free_result|ovrimos_longreadlen|ovrimos_num_fields|",
        "ovrimos_num_rows|ovrimos_prepare|ovrimos_result|ovrimos_result_all|ovrimos_rollback|pack|parentiterator|parse_ini_file|parse_ini_string|",
        "parse_str|parse_url|passthru|pathinfo|pclose|",
        "pfsockopen|php_check_syntax|",
        "php_ini_loaded_file|php_ini_scanned_files|php_logo_guid|php_sapi_name|php_strip_whitespace|php_uname|phpcredits|phpinfo|phpversion|pi|",
        "popen|pos|pow|preg_filter|",
        "preg_grep|preg_last_error|preg_match|preg_match_all|preg_quote|preg_replace|preg_replace_callback|preg_split|prev|print_r|",
        "printf|proc_close|proc_get_status|proc_nice|proc_open|proc_terminate|property_exists|",
        "putenv|quoted_printable_decode|quoted_printable_encode|quotemeta|rad2deg|rand|range|rangeexception|rar_wrapper_cache_stats|",
        "rararchive|rarentry|rarexception|rawurldecode|rawurlencode|readdir|readfile|readlink|realpath|realpath_cache_get|realpath_cache_size|recursivearrayiterator|",
        "recursivecachingiterator|recursivecallbackfilteriterator|recursivedirectoryiterator|recursivefilteriterator|recursiveiterator|",
        "recursiveiteratoriterator|recursiveregexiterator|recursivetreeiterator|reflector|",
        "regexiterator|register_shutdown_function|register_tick_function|rename|rename_function|reset|resetValue|",
        "resourcebundle|restore_error_handler|restore_exception_handler|restore_include_path|return|rewind|rewinddir|rmdir|round|rsort|rtrim|runtimeexception|sca_createdataobject|sca_getservice|sca_localproxy_createdataobject|",
        "sca_soapproxy_createdataobject|scandir|seekableiterator|",
        "serializable|serialize|setCounterClass|set_error_handler|set_exception_handler|set_file_buffer|",
        "set_include_path|set_magic_quotes_runtime|set_socket_blocking|set_time_limit|setcookie|setlocale|setproctitle|setrawcookie|",
        "setstaticpropertyvalue|setthreadtitle|settype|sha1|sha1_file|shell_exec|show_source|shuffle|signeurlpaiement|",
        "similar_text|sin|sinh|sizeof|sleep|soapclient|soapfault|",
        "soapheader|soapparam|soapserver|soapvar|sort|soundex|sphinxclient|spl_autoload|spl_autoload_call|spl_autoload_extensions|",
        "spl_autoload_functions|spl_autoload_register|spl_autoload_unregister|spl_classes|spl_object_hash|splbool|spldoublylinkedlist|splenum|",
        "splfileinfo|splfileobject|splfixedarray|splfloat|splheap|splint|split|spliti|splmaxheap|splminheap|splobjectstorage|splobserver|",
        "splpriorityqueue|splqueue|splstack|splstring|splsubject|spltempfileobject|spoofchecker|sprintf|sql_regcase|sqrt|srand|sscanf|ssdeep_fuzzy_compare|",
        "ssdeep_fuzzy_hash|ssdeep_fuzzy_hash_filename|stat|",
        "str_getcsv|str_ireplace|str_pad|str_repeat|str_replace|",
        "str_rot13|str_shuffle|str_split|str_word_count|strcasecmp|strchr|strcmp|strcoll|strcspn|stream_bucket_append|stream_bucket_make_writeable|",
        "stream_bucket_new|stream_bucket_prepend|stream_context_create|stream_context_get_default|stream_context_get_options|",
        "stream_context_get_params|stream_context_set_default|stream_context_set_option|stream_context_set_params|stream_copy_to_stream|",
        "stream_encoding|stream_filter_append|stream_filter_prepend|stream_filter_register|stream_filter_remove|stream_get_contents|",
        "stream_get_filters|stream_get_line|stream_get_meta_data|stream_get_transports|stream_get_wrappers|stream_is_local|",
        "stream_notification_callback|stream_register_wrapper|stream_resolve_include_path|stream_select|stream_set_blocking|stream_set_read_buffer|",
        "stream_set_timeout|stream_set_write_buffer|stream_socket_accept|stream_socket_client|stream_socket_enable_crypto|stream_socket_get_name|",
        "stream_socket_pair|stream_socket_recvfrom|stream_socket_sendto|stream_socket_server|stream_socket_shutdown|stream_supports_lock|",
        "stream_wrapper_register|stream_wrapper_restore|stream_wrapper_unregister|streamwrapper|strftime|strip_tags|stripcslashes|stripos|",
        "stripslashes|stristr|strlen|strnatcasecmp|strnatcmp|strncasecmp|strncmp|strpbrk|strpos|strptime|strrchr|strrev|strripos|strrpos|strspn|",
        "strstr|strtok|strtolower|strtotime|strtoupper|strtr|strval|substr|substr_compare|substr_count|substr_replace|svm|svmmodel|symlink|sys_get_temp_dir|sys_getloadavg|syslog|system|tag|tan|tanh|",
        "tcpwrap_check|tempnam|time|",
        "time_nanosleep|time_sleep_until|timezone_abbreviations_list|timezone_identifiers_list|timezone_location_get|timezone_name_from_abbr|",
        "timezone_name_get|timezone_offset_get|timezone_open|timezone_transitions_get|timezone_version_get|tmpfile|token_get_all|token_name|",
        "tostring|tostring|touch|transliterator|traversable|trigger_error|trim|uasort|ucfirst|",
        "ucwords|udm_add_search_limit|udm_alloc_agent|udm_alloc_agent_array|udm_api_version|udm_cat_list|udm_cat_path|udm_check_charset|",
        "udm_check_stored|udm_clear_search_limits|udm_close_stored|udm_crc32|udm_errno|udm_error|udm_find|udm_free_agent|udm_free_ispell_data|",
        "udm_free_res|udm_get_doc_count|udm_get_res_field|udm_get_res_param|udm_hash32|udm_load_ispell_data|udm_open_stored|udm_set_agent_param|",
        "uksort|umask|underflowexception|unexpectedvalueexception|uniqid|unlink|unpack|unregister_tick_function|unserialize|unset|",
        "urldecode|urlencode|use_soap_error_handler|user_error|usleep|usort|v8js|v8jsexception|var_dump|var_export|version_compare|vfprintf|virtual|",
        "vprintf|vsprintf|wordwrap|",
        "xpath_eval|xpath_eval_expression|xpath_new_context|xpath_register_ns|",
        "xpath_register_ns_auto|xptr_eval|xptr_new_context|zend_logo_guid|zend_thread_id|zend_version"
    ];

    var strKeywords =
        "abstract|and|array|as|break|case|catch|class|clone|const|continue|declare|default|die|do|echo|else|elseif|empty|enddeclare|endfor|endforeach|endif|" +
        "endswitch|endwhile|eval|exit|extends|final|for|foreach|function|global|goto|if|implements|include|include_once|interface|instanceof|isset|list|namespace|new|or|print|private|protected|" +
        "public|require|require_once|return|static|switch|throw|try|unset|use|var|while|xor";

    var strPredefinedConstants =
        "true|false|null|__CLASS__|__DIR__|__FILE__|__LINE__|__METHOD__|__FUNCTION__|__NAMESPACE__";

    var strPredefinedVariables =
        "$GLOBALS|$_SERVER|$_GET|$_POST|$_FILES|$_REQUEST|$_SESSION|$_ENV|$_COOKIE|$php_errormsg|$HTTP_RAW_POST_DATA|" +
        "$http_response_header|$argc|$argv";

    var keywords                = strKeywords.split("|"),
        predefinedConstants     = strPredefinedConstants.split("|"),
        predefinedVariables     = strPredefinedVariables.split("|"),
        predefinedFunctions     = strPredefinedFunctions.join('').split('|');

    exports.predefinedConstants = predefinedConstants;
    exports.predefinedVariables = predefinedVariables;
    exports.keywords = keywords;
    exports.predefinedFunctions = predefinedFunctions;
});
