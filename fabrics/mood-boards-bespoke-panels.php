<?php include('../perch/runtime.php'); 

    perch_layout('global.top');

    perch_content('Hero');
    
    perch_gallery_album_details('mood-boards-bespoke-panels', array(
            'template' => 'fabrics-album.html'));
        
	perch_gallery_album_images('mood-boards-bespoke-panels', array(
            'template' => 'fabrics-album-image.html'));

    perch_content('Share');

    perch_content('Footer');

    perch_layout('global.bottom');

?>