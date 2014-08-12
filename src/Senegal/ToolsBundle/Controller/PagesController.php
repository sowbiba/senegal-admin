<?php

namespace Senegal\ToolsBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;

class PagesController extends Controller
{
    /**
     * @param null $anything
     *
     * @Route("/{anything}")
     * @Template()
     *
     * @return array
     * @throws \Symfony\Component\HttpKernel\Exception\NotFoundHttpException
     */
    public function homeAction($anything = null)
    {
        ob_start();
        $this->get('senegal.bridge')->handle();
        $content = ob_get_contents();
        ob_end_clean();

        return $this->renderLegacy($content);
    }

}
