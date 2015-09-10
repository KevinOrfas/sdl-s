<?php
PerchSystem::register_feather('MyFeather');

class PerchFeather_MyFeather extends PerchFeather
{
  public function get_css($opts, $index, $count)
    {
      return $this->_single_tag('link', array(
        'rel'=>'stylesheet',
        'href'=>$this->path.'/css/app.css',
        'type'=>'text/css'
       ));
      }

  public function get_javascript($opts, $index, $count)
    {
      return $this->_script_tag(array(
        'src'=>$this->path.'/scripts/main.js'
       ));
      }
}
?>
