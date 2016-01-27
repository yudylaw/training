<?php
/**
 * 课程学习
 * @author sjzhao
 *
 */
class IndexAction extends Action {
    /**
     * 课程学习首页
     */
    public function index() {
        /* $courseresourcemodel = Model('CourseResource');
        for($i=1;$i<=5;$i++){
            for ($j=1;$j<=10;$j++){
                $data['course_id'] = $j;
                $data['title'] = "完全平方公式与平方差公式--视频讲解".$i.$j;
                $data['utime'] = time();
                $data['ext'] = $i % 2 == 1 ? "flv" : "doc";
                $data['description'] = "this is a very good resourse";
                $data['save_path'] = "/data/upload".$i.$j.'.'.$data['ext'];
                echo $courseresourcemodel->addCourseResource($data);
            }
        } */
        $con['limit'] = !empty($_REQUEST['limit']) ? $_REQUEST['limit'] : 5;//分页大小
        $result = model("CourseLearning")->getCourseLearningByCondition($con);
        $data = $result['data'];
        $totalRows = $result['totalRows'];
        $p = new Page($totalRows,$con['limit']);
        $page = $p->show();
        $this->resource = $result['data'];
        $this->page = $page;
        $this->display();
    }
    /**
     * 课程资源列表页面
     */
    public function detail() {
        $id = $_REQUEST['id'];//课程id
        $courseresource = model('Course')->getCourseByCondition(array('id'=>$id));
        $this->courseresource = $courseresource;
        $this->display();
    }
    
    public function add(){
        $data = array();
        $data['title'] = "完全平方公式与平方差公式";
        $data['creator'] = $this->uid;
        $data['subject'] = $this->getSubject();
        $data['required'] = 1;
        $data['description'] = "这个课程不错";
        $data['ctime'] = time();
        $result = Model('Course')->addCourse($data);
        echo $result;
    }
    
    public function getSubject() {
        $rand = rand(0, 10);
        if($rand > 9){
            return "10".$rand;
        }else{
            return "100".$rand;
        }
    }
}