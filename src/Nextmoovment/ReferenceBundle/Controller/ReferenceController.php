<?php

namespace Nextmoovment\ReferenceBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class ReferenceController extends Controller {

    public function indexAction($name) {
        return $this->render('NextmoovmentReferenceBundle:Default:index.html.twig', array('name' => $name));
    }

    public function menuAction() {
        return $this->render('NextmoovmentReferenceBundle:Default:menu.html.twig', array(
                    'menu_actif' => 1
        ));
    }

}
