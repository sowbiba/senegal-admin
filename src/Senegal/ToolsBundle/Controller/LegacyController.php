<?php

namespace Senegal\ToolsBundle\Controller;

use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Template;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;

class LegacyController extends Controller
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
    public function indexAction($anything = null)
    {
        return $this->getLegacyContent();
    }

    /**
     * @Template()
     *
     * @return array|JsonResponse
     *
     */
    public function contractCardAction()
    {
        return $this->getLegacyContent();
    }

    /**
     * @Template("SenegalToolsBundle:Legacy:contractCard.html.twig")
     *
     * @return array|JsonResponse
     *
     */
    public function contractCardNodeTableAction()
    {
        return $this->getLegacyContent();
    }


    /**
     * @Template()
     * @return array|JsonResponse
     */
    public function productLineChaptersAction()
    {
        return $this->getLegacyContent();
    }

    /**
     * @Template()
     * @return array|JsonResponse
     */
    public function mkgCampaignAction()
    {
        return $this->getLegacyContent();
    }

    /**
     *
     * @Template()
     *
     * @param $fieldId
     *
     * @return array|JsonResponse
     */
    public function fieldEditAction($fieldId)
    {
        return $this->getLegacyContent(array("fieldId" => $fieldId));
    }

    /**
     * @Template("SenegalToolsBundle:Legacy:fieldEdit.html.twig")
     * @return array|JsonResponse
     */
    public function formulaTesterToolAction()
    {
        return $this->getLegacyContent();
    }


    /**
     * @Template()
     * @return array|JsonResponse
     */
    public function flagsChampsAction()
    {
        return $this->getLegacyContent();}

    /**
     * @Template("SenegalToolsBundle:Legacy:noLayout.html.twig")
     * @return array|JsonResponse
     */
    public function getParentDataAction()
    {
        return $this->getLegacyContent();
    }

    /**
     * @Template("SenegalToolsBundle:Legacy:noLayout.html.twig")
     * @return string
     */
    public function getLegacyAjaxHtmlResponseAction()
    {
        return $this->getLegacyContent();
    }

    /**
     * @param Request $request
     *
     * @Template()
     *
     * @return array|JsonResponse
     */
    public function sfGuardUserAction(Request $request)
    {
        $user = $request->get("id") != "" ? $this->getSdk("user")->getById((int) $request->get("id")) : null;
        return $this->getLegacyContent(array("user" => $user));
    }

    /**
     * @Template()
     * @return array|JsonResponse
     */
    public function invoicingAction()
    {
        return $this->getLegacyContent();
    }

    /**
     * Use this when we need to return brut result like csv or xls,...
     *
     * @Template("SenegalToolsBundle:Legacy:noLayout.html.twig")
     */
    public function stupidAction()
    {
        $this->get('senegal.bridge')->handle();

        return new Response();
    }

    /**
     * Use this when we need to return brut result like csv or xls,...
     *
     * @Template("SenegalToolsBundle:Legacy:noLayout.html.twig")
     */
    public function stupidPngAction()
    {
        $this->get('senegal.bridge')->handle();

        $response = new Response();
        $response->headers->set('Content-Type', 'image/png');

        return $response;
    }

    /**
     * @param array $params
     *
     * @return array|JsonResponse
     */
    private function getLegacyContent($params = array())
    {
        ob_start();
        $this->get('senegal.bridge')->handle();
        $content = ob_get_contents();
        ob_end_clean();

        return $this->renderLegacy($content, $params);
    }

    /**
     * @Template("SenegalToolsBundle:Legacy:importation.html.twig")
     */
    public function importationAction()
    {
        return $this->getLegacyContent();
    }

}
