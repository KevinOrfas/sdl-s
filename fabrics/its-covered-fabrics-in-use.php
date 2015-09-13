<?php include('../perch/runtime.php'); 

    perch_layout('global.top');

    perch_content('Hero');
    
    perch_gallery_album_details('its-covered-fabrics-in-use', array(
            'template' => 'fabrics-album.html'));
        
	perch_gallery_album_images('its-covered-fabrics-in-use', array(
            'template' => 'fabrics-album-image.html'));

    perch_content('Share');

    perch_content('Footer');

    perch_layout('global.bottom');

?>