<?php 

class AdminAction extends Action {
    
    private $types = array('单选题'=>1, '多选题'=>2, '简答题'=>3);
    
    public function upload() {
        //调用本地上传
        $this->localUpload(array());
    }
    /**
     * 上传方法
     * @param array $options
     */
    private function localUpload($options,$input_options=null){
    
        $system_default = model('Xdata')->get('admin_Config:attach');
        if(empty($system_default['attach_path_rule']) || empty($system_default['attach_max_size']) || empty($system_default['attach_allow_extension'])) {
            $system_default['attach_path_rule'] = 'Y/md/H/';
            $system_default['attach_max_size'] = '100'; 		// 默认100M
            $system_default['attach_allow_extension'] = 'flv';
            model('Xdata')->put('admin_Config:attach', $system_default);
        }
        // 载入默认规则
        $default_options = array();
        $default_options['custom_path']	= date($system_default['attach_path_rule']);					// 应用定义的上传目录规则：'Y/md/H/'
        $default_options['max_size'] = floatval($system_default['attach_max_size']) * 1024 * 1024;		// 单位: 兆
        $default_options['allow_exts'] = "xls,xlsx"; 					// 'jpg,gif,png,jpeg,bmp,zip,rar,doc,xls,ppt,docx,xlsx,pptx,pdf'
        $default_options['save_path'] =	UPLOAD_PATH.'/'.$default_options['custom_path'];
        $default_options['save_name'] =	''; //指定保存的附件名.默认系统自动生成
        $default_options['save_to_db'] = true;
        // 定制化设这，覆盖默认设置
        $options = is_array($input_options) ? array_merge($default_options,$input_options) : $default_options;
        // 初始化上传参数
        $upload	= new UploadFile($options['max_size'], $options['allow_exts'], array());
        // 设置上传路径
        $upload->savePath = $options['save_path'];
        // 启用子目录
        $upload->autoSub = false;
        // 保存的名字
        $upload->saveName = $options['save_name'];
        // 默认文件名规则
        $upload->saveRule = $options['save_rule'];
        // 是否缩略图
        if ($options['auto_thumb'] == 1) {
            $upload->thumb = true;
        }
    
        // 创建目录
        mkdir($upload->save_path, 0777, true);
    
        // 执行上传操作
        if(!$upload->upload()) {
            // 上传失败，返回错误
            $return['status'] = false;
            $return['info']	= $upload->getErrorMsg();
            return $return;
        } else {
            $upload_info = $upload->getUploadFileInfo();
            // 保存信息到附件表
            $data = $this->saveInfo($upload_info, $options);
            $filepath = $default_options['save_path'].$data['save_name'];
            //生成试卷
            $this->createPaper($filepath);
            // 输出信息
            $return['status'] = true;
            $return['info']   = '{"status":1}';
            // 上传成功，返回信息
            return $return;
        }
    }
    
    /**
     * 保存上传信息
     * @param array $upload_info
     * @param array $options
     */
    private function saveInfo($upload_info,$options){
        foreach($upload_info as $u) {
            $name = t($u['name']);
            $data['title'] = $name ? $name : $u['savename'];
            $data['utime'] = time();
            $data['ext'] = strtolower($u['extension']);
            $data['size'] = $u['size'];
            $data['save_path'] = $options['custom_path'];
            $data['save_name'] = $u['savename'];
            $data['status'] = 1;
        }
        return $data;
    }
    
    /**
     * 导入试卷模板,生成考试试卷
     */
    public function createPaper($filename) {
        // Check
        if (!file_exists($filename)) {
            exit("not found ".$filename);
        }
        
        /** PHPExcel_IOFactory */
        require_once ADDON_PATH . '/library/PHPExcel/IOFactory.php';
        
        $reader = PHPExcel_IOFactory::createReader('Excel5'); //设置以Excel5格式(Excel97-2003工作簿)
        $PHPExcel = $reader->load($filename); // 载入excel文件
        $sheet = $PHPExcel->getSheet(0); // 读取第一個工作表
        $highestRow = 39; // 取得总行数
        $highestColumm = 'H'; // 取得总列数
        
        $title = $sheet->getCell('A1')->getValue();//标题
        $totalScore = $sheet->getCell('H2')->getCalculatedValue();//总分,读表达式的值
        $passScore = $sheet->getCell('H3')->getValue();//及格分
        
        if(C('LOG_RECORD')) {
            if(empty($title)) {
                Log::write("试卷名称不能为空", Log::ERR);
                return;
            }
            if(!is_numeric($totalScore) || !is_numeric($passScore)) {
                Log::write($title.'--'.$totalScore. " AND " . $passScore . '必须同时为整数', Log::ERR);
                return;
            }
        }
        
        $uid = $this->mid;
        $actionTime = time();
        $paper = array("name"=>$title, "uid"=>$uid, "ctime"=>$actionTime, "type"=>0,
            "total_score"=>$totalScore, "pass_score"=>$passScore, "is_del"=>0);
        $hw_id = M('homework')->add($paper);
        
        if(C('LOG_RECORD')) {
            Log::write("创建作业:hw_id=$hw_id,name=".$paper['name'].json_encode($paper), Log::INFO);
        }
        
        $items = array();
        
        //读取试卷
        for ($row = 5; $row <= $highestRow; $row++){
            $type = $sheet->getCell('A'.$row)->getValue();//题型
            if (empty($type)) {
                continue;
            }
            $value = $this->types[$type];//题型编号
            if (!in_array($value, array(1,2,3))) {
                if(C('LOG_RECORD')) {
                    Log::write("无法导入的题型:" + $type, Log::WARN);
                }
                continue;
            }
            $qname = $sheet->getCell('B'.$row)->getValue();
            $answer = $sheet->getCell('G'.$row)->getValue();//答案，简答题答案为空
            $score = $sheet->getCell('H'.$row)->getValue();
            
            if(C('LOG_RECORD')) {
                if(empty($qname)) {
                    Log::write($title . "--的题目不能为空:" + $type, Log::WARN);
                    continue;
                }
                if(!is_numeric($score)) {
                    Log::write($qname.'--的分数'.$score.'必须为整数', Log::ERR);
                    continue;
                }
            }
            
            $question = array('hw_id'=>$hw_id, 'type'=>$value, 'name'=>$qname, 
                'score'=>$score, 'num'=>$row - 4, 'is_del'=>0);
            
            if (!empty($answer)) {
                $answer = implode(',', str_split($answer));
                $question['answer'] = $answer;
            }
            //type:单选题, 多选题, 简单题
            //简单题只有标题，没用答案，需要老师批改
            if (in_array($type, array('单选题', '多选题'))) {
                if(C('LOG_RECORD')){
                    if (empty($answer)) {
                        Log::write($qname.'--单选题、多选题的答案不能为空', Log::ERR);
                        continue;
                    }
                }
                $a_option = $sheet->getCell('C'.$row)->getValue();
                if (!empty($a_option)) {
                    $question['a_option'] = $a_option;
                }
                $b_option = $sheet->getCell('D'.$row)->getValue();
                if (!empty($b_option)) {
                    $question['b_option'] = $b_option;
                }
                $c_option = $sheet->getCell('E'.$row)->getValue();
                if (!empty($c_option)) {
                    $question['c_option'] = $c_option;
                }
                $d_option = $sheet->getCell('F'.$row)->getValue();
                if (!empty($d_option)) {
                    $question['d_option'] = $d_option;
                }
            }
            $qid = M('homework_question')->add($question);
            if(C('LOG_RECORD')) {
                Log::write("创建试题:qid=$qid,name=".$question['name'].json_encode($question), Log::INFO);
            }
        }
    }
    
    public function classlist() {
        //参数 p=currentPage
        $pageSize = 20;
        $result = M("homework")->where(array('type'=>0,'is_del'=>0))->order('id desc')->findPage($pageSize);
    
        $h_ids = array();
    
        $homeworks = $result['data'];
    
        foreach ($homeworks as $homework) {
            array_push($h_ids, $homework['id']);
        }
    
        $this->assign("homeworks", $homeworks);
        $this->assign("page", $result['html']);
        $this->display("homework_list");
    }
    
}