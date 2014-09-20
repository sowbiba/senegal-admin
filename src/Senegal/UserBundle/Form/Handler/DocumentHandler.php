<?php

namespace Pfd\ContractBundle\Form\Handler;

use Pfd\Sdk\Model\Contract;
use Pfd\Sdk\Model\Revision;
use Pfd\Sdk\SdkInterface;
use Symfony\Component\Form\Form;
use Symfony\Component\HttpFoundation\Request;

class DocumentHandler
{
    protected $sdk;
    protected $request;

    /**
     * @param Request      $request
     * @param SdkInterface $sdk
     */
    public function __construct(Request $request, SdkInterface $sdk)
    {
        $this->request = $request;
        $this->sdk  = $sdk;
    }

    /**
     * Check the request and process the form at POST method
     *
     * @param Form     $form
     * @param Contract $contract
     * @param Revision $revision
     *
     * @return bool
     */
    public function process(Form $form, Contract $contract = null, Revision $revision = null)
    {
        if ('POST' !== $this->request->getMethod()) {
            return false;
        }

        $form->submit($this->request);

        if (!$form->isValid()) {
            return false;
        }

        $document = $form->getData();

        if (null === $document->getId()) {
            $this->sdk->create($document);
            $this->sdk->addDocumentToContract($document, $contract);

            if (null !== $revision && $revision->getId()) {
                $this->sdk->addDocumentToRevision($document, $revision);
            }
        } else {
            $this->sdk->update($document);
        }

        return true;
    }
}
