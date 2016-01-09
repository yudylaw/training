<?php
/* # include base class */
import(APPS_PATH . '/admin/Lib/Action/AdministratorAction.class.php');

/**
 * APP 客户端设置
 *
 * @package ThinkSNS\App\Admin\Application
 * @author Medz Seven <lovevipdsw@vip.qq.com>
 **/
class ApplicationAction extends AdministratorAction
{

	/**
	 * 轮播列表设置类型
	 *
	 * @var string
	 **/
	protected $type = array(
		'false'   => '仅展示',
		'url'     => 'URL地址',
		'weiba'   => '微吧',
		'post'    => '帖子',
		'weibo'   => '微博',
		'topic'   => '话题',
		'channel' => '频道',
		'user'    => '用户',
	);

	/**
	 * 轮播列表
	 *
	 * @return void
	 * @author Medz Seven <lovevipdsw@vip.qq.com>
	 **/
	public function index()
	{
		$this->pageKeyList = array('title', 'image', 'type', 'data', 'doAction');
		array_push($this->pageTab, array(
			'title'   => '轮播列表',
			'tabHash' => 'index',
			'url'     => U('admin/Application/index')
		));
		array_push($this->pageTab, array(
			'title'   => '添加轮播',
			'tabHash' => 'addSlide',
			'url'     => U('admin/Application/addSlide')
		));

		$list = D('application_slide')->findPage(20);

		foreach ($list['data'] as $key => $value) {
			// # 参数
			$aid = $value['image'];
			$id  = $value['id'];

			$list['data'][$key]['type'] = $this->type[$value['type']];

			// # 添加图片
			$value = '<a href="%s" target="_blank"><img src="%s" width="300px" height="140px"></a>';
			$value = sprintf($value, getImageUrlByAttachId($aid), getImageUrlByAttachId($aid, 300, 140));
			$list['data'][$key]['image'] = $value;

			// # 添加操作按钮
			$value = '[<a href="%s">编辑</a>]&nbsp;-&nbsp;[<a href="%s">删除</a>]';
			$value = sprintf($value, U('admin/Application/addSlide', array('id' => $id, 'tabHash' => 'addSlide')), U('admin/Application/delSlide', array('id' => $id)));
			$list['data'][$key]['doAction'] = $value;
		}

		$this->allSelected = false;

		$this->displayList($list);
	}

	/**
	 * 添加|修改 幻灯
	 *
	 * @return void
	 * @author Medz Seven <lovevipdsw@vip.qq.com>
	 **/
	public function addSlide()
	{
		$this->pageKeyList = array('title', 'image', 'type', 'data');
		array_push($this->pageTab, array(
			'title'   => '轮播列表',
			'tabHash' => 'index',
			'url'     => U('admin/Application/index')
		));
		array_push($this->pageTab, array(
			'title'   => '添加轮播',
			'tabHash' => 'addSlide',
			'url'     => U('admin/Application/addSlide')
		));

		$this->opt['type'] = $this->type;

		$this->savePostUrl = U('admin/Application/doSlide', array('id' => intval($_GET['id'])));

		$data = array();

		if (isset($_GET['id']) and intval($_GET['id'])) {
			$data = D('application_slide')->where('`id` = ' . intval($_GET['id']))->find();
		}

		$this->displayConfig($data);
	}

	/**
	 * 添加|修改幻灯数据
	 *
	 * @return void
	 * @author Medz Seven <lovevipdsw@vip.qq.com>
	 **/
	public function doSlide()
	{
		list($id, $title, $image, $type, $data) = array($_GET['id'], $_POST['title'], $_POST['image'], $_POST['type'], $_POST['data']);
		list($id, $title, $image, $type, $data) = array(intval($id), t($title), intval($image), t($type), $data);

		if (!in_array($type, array('false', 'url', 'weiba', 'post', 'weibo', 'topic', 'channel', 'user'))) {
			$this->error('跳转类型不正确');
		} elseif (!$title) {
			$this->error('标题不能为空');
		} elseif (!$image) {
			$this->error('必须上传轮播图片');
		}

		$data = array(
			'title' => $title,
			'image' => $image,
			'type'  => $type,
			'data'  => $data
		);

		if ($id and D('application_slide')->where('`id` = ' . $id)->field('id')->count()) {
			D('application_slide')->where('`id` = ' . $id)->save($data);
			$this->success('修改成功');
		}

		D('application_slide')->add($data) or $this->error('添加失败');

		$this->assign('jumpUrl', U('admin/Application/index'));
		$this->success('添加成功');
	}

	/**
	 * 删除幻灯
	 *
	 * @return void
	 * @author Medz Seven <lovevipdsw@vip.qq.com>
	 **/
	public function delSlide()
	{
		$id = intval($_GET['id']);
		D('application_slide')->where('`id` = ' . $id)->delete();
		$this->success('删除成功');
	}

	/*======================== Socket setting start ===========================*/
	/**
	 * Socket 服务器设置
	 *
	 * @return void
	 * @author Medz Seven <lovevipdsw@vip.qq.com>
	 **/
	public function socket()
	{
		$this->pageKeyList = array('socketaddres');
		array_push($this->pageTab, array(
			'title' => 'Socket服务器地址设置',
			'hash'  => 'socket',
			'url'   => U('admin/Application/socket')
		));
		$this->displayConfig();
	}
	/*======================== Socket setting end   ===========================*/

	/*================= Application about setting start ========================*/
	/**
	 * 客户端About页面设置
	 *
	 * @return void
	 * @author Medz Seven <lovevipdsw@vip.qq.com>
	 **/
	public function about()
	{
		$this->pageKeyList = array('about');
		array_push($this->pageTab, array(
			'title' => '关于我们设置',
			'hash'  => 'about',
			'url'   => U('admin/Application/about')
		));
		$this->displayConfig();
	}
	/*================= Application about setting end   ========================*/

	/*================ Application feedback setting start ======================*/
	/**
	 * APP反馈管理
	 *
	 * @return void
	 * @author Medz Seven <lovevipdsw@vip.qq.com>
	 **/
	public function feedback()
	{
		$this->pageKeyList = array('user', 'content', 'time', 'doaction');
		array_push($this->pageTab, array(
			'title' => 'APP反馈管理',
			'hash'  => 'feedback',
			'url'   => U('admin/Application/feedback')
		));
		$this->allSelected = false;

		/* # 每页显示的条数 */
		$number = 20;

		/* # 反馈类型，app反馈为1 */
		$type = 1;

		/* # 是否按照时间正序排列 */
		$asc = false;

		$list = model('Feedback')->findDataToPageByType($type, $number, $asc);

		foreach ($list['data'] as $key => $value) {
			$data = array();
			$data['content'] = $value['content'];
			$data['user']    = getUserName($value['uid']);
			$data['time']    = friendlyDate($value['cTime']);

			$data['doaction']= '<a href="' . U('admin/Application/deleteFeedback', array('fid' => $value['id'])) . '">[删除反馈]</a>';

			$list['data'][$key] = $data;
		}
		unset($data, $key, $value);

		$this->displayList($list);
	}

	/**
	 * 删除反馈
	 *
	 * @return void
	 * @author Medz Seven <lovevipdsw@vip.qq.com>
	 **/
	public function deleteFeedback()
	{
		$fid = intval($_REQUEST['fid']);
		model('Feedback')->delete($fid);
		$this->success('删除成功！');
	}
	/*================ Application feedback setting End   ======================*/


} // END class ApplicationAction extends AdministratorAction