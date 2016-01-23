<?php 

class AdminAction extends Action {
    
    private $types = array('单选题'=>1, '多选题'=>2, '简答题'=>3);
    
    /**
     * 导入试卷模板,生成考试试卷
     */
    public function createPaper() {
        $filename = SITE_PATH . "/paper_template.xls";
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
        
        $uid = 0;//TODO
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
    
}