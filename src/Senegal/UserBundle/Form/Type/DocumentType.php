<?php
namespace Pfd\ContractBundle\Form\Type;

use Pfd\ContractBundle\Form\Transformer\DateTimeToStringTransformer;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\Form\FormEvent;
use Symfony\Component\Form\FormEvents;
use Symfony\Component\HttpFoundation\File\UploadedFile;
use Symfony\Component\OptionsResolver\OptionsResolverInterface;

class DocumentType extends AbstractType
{
    /**
     * @var string
     */
    protected $uploadFileDir;

    /**
     * @param string $uploadFileDir
     */
    public function __construct($uploadFileDir)
    {
        $this->uploadFileDir = $uploadFileDir;
    }

    /**
     * @param FormBuilderInterface $builder
     * @param array                $options
     */
    public function buildForm(FormBuilderInterface $builder, array $options)
    {
        $transformer = new DateTimeToStringTransformer(null, null, 'd/m/Y');

        $releasedAt = $builder->create('releasedAt', 'text',
            [
                //@TODO: [DATE FORMAT] PR needed to fix this case too (Bad validation on a date type if we constraint format)
                'label'    => 'Date d\'édition (jj/mm/yyyy)',
                'attr'     => ['pattern' => '[0-9]{2}/[0-9]{2}/[0-9]{4}', 'class' => 'date filter-date'],
                'required' => false,
            ]
        )->addModelTransformer($transformer);

        $fileOptions = array(
            'label'       => 'Fichier (PDF uniquement)',
            'required'    => false,
            'attr'        => ['class'  => 'col-12 filter-file form-control jquery-file-upload']
        );

        $builder
            ->add('type', 'sdk_model',
                [
                    'label'         => 'Nature',
                    'class'         => 'Pfd\Sdk\Model\DocumentType',
                    'empty_value'   => 'Veuillez choisir une nature',
                    'required'      => true,
                    'order_by'      => 'name',
                    'attr'        => ['class' => 'col-12 filter-type form-control']
                ]
            )
            ->add('file', 'file', $fileOptions)
            ->add($releasedAt)
            ->add('reference', 'text',
                [
                    'label'    => 'Référence',
                    'required' => false,
                    'attr'     => ['class' => 'col-12 filter-reference form-control']
                ]
            )
            ->add('description', 'textarea',
                [
                    'label'    => 'Description',
                    'required' => false,
                    'attr'     => ['class' => 'col-12 filter-description form-control']
                ]
            )
            ->add('pageOffset', 'integer',
                [
                    'label'             => 'Décalage de la page (optionnel)',
                    'empty_data'        => '0',
                    'invalid_message'   => "Cette valeur n'est pas valide. Merci de ne pas mettre de signe si le décalage est positif.",
                    'attr'              => ['class' => 'col-12 filter-page-offset form-control col-lg-2']
                ]
            )
            ->add('id', 'hidden');

        // Upload file before form submit
        $builder->addEventListener(FormEvents::PRE_SUBMIT, function (FormEvent $event) use ($options, $fileOptions) {
            $data = $event->getData();

            // Either if the file is not submitted or is bigger and the upload did'nt work, then we use the existing file of the document
            if (!isset($data['file']) || empty($data['file']['filename'])) {
                $data['file'] = null;
            }

            // If the file is submitted as the string, it mean that we use the ajax file upload
            // So we have to move the file from temporary directory to the final one
            if (!empty($data['file']) && !$data['file'] instanceof UploadedFile) {

                // The file must have a filename, means that the uploading of the temporary file worked
                if (!empty($data['file']['filename'])) {
                    // Here we rebuild the form element to add the data to the input so we don't have to input the file again
                    $event->getForm()->remove('file');
                    $fileOptions['attr']['data-filename'] = $data['file']['filename'];
                    $fileOptions['attr']['data-original-filename'] = $data['file']['originalFilename'];
                    $event->getForm()->add('file', 'file', $fileOptions);

                    // And here we transform the string to an UploadedFile
                    $filePath = $this->uploadFileDir . $data['file']['filename'];
                    $fileSize = @filesize($filePath);
                    $data['file'] = new UploadedFile($filePath, $data['file']['originalFilename'], null, $fileSize, null, true);
                }
            }

            $event->setData($data);
        });
    }

    /**
     * @param OptionsResolverInterface $resolver
     */
    public function setDefaultOptions(OptionsResolverInterface $resolver)
    {
        $resolver->setDefaults(array(
            'data_class'      => 'Pfd\Sdk\Model\Document',
            'csrf_protection' => false,
        ));
    }

    /**
     * @return string
     */
    public function getName()
    {
        return 'document';
    }
}
