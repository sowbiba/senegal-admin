<?php

namespace Nextmoovment\ReferenceBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

class ReferenceController extends Controller {

    public function indexAction($name) {
        return $this->render('NextmoovmentReferenceBundle:Default:index.html.twig', array('name' => $name));
    }

    public function menuAction() {
        $liste = array(
            array('id' => 2, 'titre' => 'Mon dernier weekend !'),
            array('id' => 5, 'titre' => 'Sortie de Symfony2.1'),
            array('id' => 9, 'titre' => 'Petit test')
        );
        return $this->render('NextmoovmentReferenceBundle:Default:menu.html.twig', array(
                    'liste_articles' => $liste
        ));
    }

}
