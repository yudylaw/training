<?php
/**
 * ThinkSNS App基类
 * @author  liuxiaoqing <liuxiaoqing@zhishisoft.com>
 * @version TS3.0
 */
class App
{
    /**
     * App初始化
     * @access public
     * @return void
     */
    static public function init() {
        // 设定错误和异常处理
        set_error_handler(array('App','appError'));
        set_exception_handler(array('App','appException'));
        // Session初始化
        if(!session_id())
            session_start();
        // 时区检查
        date_default_timezone_set('PRC');
        // 模版检查
        
        // 语言检查

        // 加载所有插件
        if(C('APP_PLUGIN_ON')) {
            tsload(CORE_LIB_PATH.'/addons.class.php');
            tsload(CORE_LIB_PATH.'/addons/Hooks.class.php');
            tsload(CORE_LIB_PATH.'/addons/AbstractAddons.class.php');
            tsload(CORE_LIB_PATH.'/addons/NormalAddons.class.php');
            tsload(CORE_LIB_PATH.'/addons/SimpleAddons.class.php');
            tsload(CORE_LIB_PATH.'/addons/TagsAbstract.class.php');
            Addons::loadAllValidAddons();
        }
    }

    /**
     * 运行控制器
     * @access public
     * @return void
     */
    static public function run() {

        App::init();

        $GLOBALS['time_run_detail']['init_end'] = microtime(true);

        //检查服务器是否开启了zlib拓展
        if(C('GZIP_OPEN') && extension_loaded('zlib') && function_exists('ob_gzhandler')){
            ob_end_clean();
            ob_start('ob_gzhandler');
        }

        $GLOBALS['time_run_detail']['obstart'] = microtime(true);


        //API控制器
        if(APP_NAME=='api'){
            App::execApi();

            $GLOBALS['time_run_detail']['execute_api_end'] = microtime(true);

        //Widget控制器
        }elseif(APP_NAME=='widget'){
            App::execWidget();

            $GLOBALS['time_run_detail']['execute_widget_end'] = microtime(true);

        //Plugin控制器
        }elseif(APP_NAME=='plugin'){
            App::execPlugin();

            $GLOBALS['time_run_detail']['execute_plugin_end'] = microtime(true);

        //APP控制器
        }else{
            App::execApp();

            $GLOBALS['time_run_detail']['execute_app_end'] = microtime(true);

        }

        //输出buffer中的内容，即压缩后的css文件
        if(C('GZIP_OPEN') && extension_loaded('zlib') && function_exists('ob_gzhandler')){
            ob_end_flush();
        }

        $GLOBALS['time_run_detail']['obflush'] = microtime(true);
        
        if(C('LOG_RECORD')){
            Log::save();
        }

        $GLOBALS['time_run_detail']['logsave'] = microtime(true);

        return ;
    }

    /**
     * 执行App控制器
     * @access public
     * @return void
     */
    static public function execApp() {

        //防止CSRF
        if(strtoupper($_SERVER['REQUEST_METHOD'])=='POST' && stripos($_SERVER['HTTP_REFERER'], SITE_URL) !== 0 && $_SERVER['HTTP_USER_AGENT'] !== 'Shockwave Flash' && (strpos(strtolower($_SERVER['HTTP_USER_AGENT']), 'adobe flash player') === false) && MODULE_NAME!='Weixin' ) {
            die('illegal request.');
        }

        /* # 跳转移动版首页，以后有时间，可以做兼容跳转 */
        if (
            /* # 是否不是wap，强制访问pc SESSION记录 */
            $_SESSION['wap_to_normal'] != 1 and
            /* # 是否不是wap，强制访问pc SCOOKIE记录 */
            cookie('wap_to_normal')    != 1 and
            /* # 是否请求参数带强制访问 */
            $_REQUEST['wap_to_normal'] != 1 and
            /* # 默认iPad不跳转，目前iPad显示PC页面不宽 */
            !isiPad()                       and
            /* # 是否开启了移动端开关 */
            json_decode(json_encode(model('Xdata')->get('admin_Mobile:setting')), false)->switch and
            in_array(APP_NAME, array('public','channel','weiba','square','people'))              and
            MODULE_NAME != 'Widget'                                                              and
            !in_array(strtolower(MODULE_NAME), array('message', 'register', 'feed'))             and
            strtolower(ACTION_NAME) != 'message'                                                 and
            isMobile()                                                                           and
            in_array('wap', C('DEFAULT_APPS'))
        ) {
            U('w3g/Public/home', '', true);
        }
        
        $GLOBALS['time_run_detail']['addons_end'] = microtime(true);

        //创建Action控制器实例
        $className =  MODULE_NAME.'Action';
        tsload(APP_ACTION_PATH.'/'.$className.'.class.php');
        
        if(!class_exists($className)) {
          
            $className  =   'EmptyAction';
            tsload(APP_ACTION_PATH.'/EmptyAction.class.php');
            if(!class_exists($className)){
                throw_exception( L('_MODULE_NOT_EXIST_').' '.MODULE_NAME );
            }
        }

        $module =   new $className();

        $GLOBALS['time_run_detail']['action_instance'] = microtime(true);

        //异常处理
        if(!$module) {
            // 模块不存在 抛出异常
            throw_exception( L('_MODULE_NOT_EXIST_').' '.MODULE_NAME );
        }

        //获取当前操作名
        $action =   ACTION_NAME;

        //执行当前操作
        call_user_func(array(&$module,$action));

		//执行计划任务
        model('Schedule')->run();

        $GLOBALS['time_run_detail']['action_run'] = microtime(true);

        return ;
    }

    /**
     * 执行Api控制器
     * @access public
     * @return void
     */
    static public function execApi() {
        include_once (SITE_PATH.'/api/' . API_VERSION . '/'.MODULE_NAME.'Api.class.php');
        $className = MODULE_NAME.'Api';
        $module = new $className();
        $action = ACTION_NAME;
        //执行当前操作
        $data = call_user_func(array(&$module,$action));
        $format = (in_array( $_REQUEST['format'] ,array('xml','json','php','test') ) ) ?$_REQUEST['format']:'json';
        if($format=='json'){
            exit(json_encode($data));
        }elseif ($format=='xml'){

        }elseif($format=='php'){
            //输出php格式
            exit(var_export($data));
        }elseif($format=='test'){
            //测试输出
            dump($data);
            exit;
        }
        return ;
    }

    /**
     * 执行Widget控制器
     * @access public
     * @return void
     */
    static public function execWidget() {

        //防止CSRF
        if(strtoupper($_SERVER['REQUEST_METHOD'])=='POST' && stripos($_SERVER['HTTP_REFERER'], SITE_URL)!==0 && $_SERVER['HTTP_USER_AGENT'] !== 'Shockwave Flash' && (strpos(strtolower($_SERVER['HTTP_USER_AGENT']), 'adobe flash player') === false) && MODULE_NAME!='Weixin' ) {
            die('illegal request.');
        }

        //include_once (ADDON_PATH.'/widget/'.MODULE_NAME.'Widget/'.MODULE_NAME.'Widget.class.php');
        //$className = MODULE_NAME.'Widget';
        if(file_exists(ADDON_PATH.'/widget/'.MODULE_NAME.'Widget/'.MODULE_NAME.'Widget.class.php') && !isset($_GET['app_widget']) ){
            tsload(ADDON_PATH.'/widget/'.MODULE_NAME.'Widget/'.MODULE_NAME.'Widget.class.php');
        }else{
            if(file_exists(APP_PATH.'/Lib/Widget/'.MODULE_NAME.'Widget/'.MODULE_NAME.'Widget.class.php')){
                tsload(APP_PATH.'/Lib/Widget/'.MODULE_NAME.'Widget/'.MODULE_NAME.'Widget.class.php');
            }else{
            	tsload(APPS_PATH.'/'.$_GET['app_widget'].'/Lib/Widget/'.MODULE_NAME.'Widget/'.MODULE_NAME.'Widget.class.php');
            }
        }
        $className = MODULE_NAME.'Widget';

        $module =   new $className();
      
        //异常处理
        if(!$module) {
            // 模块不存在 抛出异常
            throw_exception( L('_MODULE_NOT_EXIST_').MODULE_NAME );
        }

        //获取当前操作名
        $action =   ACTION_NAME;

        //执行当前操作
        if($rs = call_user_func(array(&$module,$action))){
            echo $rs;
        }
        return ;
    }

    /**
     * app异常处理
     * @access public
     * @return void
     */
    static public function appException($e) {
        die('system_error:'.$e->__toString());
    }

    /**
     * 自定义错误处理
     * @access public
     * @param int $errno 错误类型
     * @param string $errstr 错误信息
     * @param string $errfile 错误文件
     * @param int $errline 错误行数
     * @return void
     */
    static public function appError($errno, $errstr, $errfile, $errline) {
      switch ($errno) {
          case E_ERROR:
          case E_USER_ERROR:
            $errorStr = "[$errno] $errstr ".basename($errfile)." 第 $errline 行.";
            //if(C('LOG_RECORD')) Log::write($errorStr,Log::ERR);
            echo $errorStr;
            break;
          case E_STRICT:
          case E_USER_WARNING:
          case E_USER_NOTICE:
          default:
            $errorStr = "[$errno] $errstr ".basename($errfile)." 第 $errline 行.";
            //Log::record($errorStr,Log::NOTICE);
            break;
      }
    }

};//类定义结束