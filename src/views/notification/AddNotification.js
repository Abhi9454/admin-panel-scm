import React, { useState } from 'react'
import { CKEditor, useCKEditorCloud } from '@ckeditor/ckeditor5-react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CFormSelect,
  CRow,
} from '@coreui/react'

const AddNotification = () => {
  const [activeTab, setActiveTab] = useState('parents')
  const cloud = useCKEditorCloud({
    version: '44.2.0',
    premium: false,
  })

  if (cloud.status === 'error') {
    return <div>Error!</div>
  }

  if (cloud.status === 'loading') {
    return <div>Loading...</div>
  }

  const {
    ClassicEditor,
    Autoformat,
    AutoImage,
    Autosave,
    BlockQuote,
    Bold,
    Code,
    Emoji,
    Essentials,
    FindAndReplace,
    FontBackgroundColor,
    FontColor,
    FontFamily,
    FontSize,
    Heading,
    Highlight,
    ImageBlock,
    ImageCaption,
    ImageEditing,
    ImageInline,
    ImageInsert,
    ImageInsertViaUrl,
    ImageResize,
    ImageStyle,
    ImageTextAlternative,
    ImageToolbar,
    ImageUpload,
    ImageUtils,
    Indent,
    IndentBlock,
    Italic,
    Link,
    LinkImage,
    List,
    ListProperties,
    Markdown,
    MediaEmbed,
    Mention,
    Paragraph,
    PasteFromOffice,
    RemoveFormat,
    SimpleUploadAdapter,
    SpecialCharacters,
    SpecialCharactersArrows,
    SpecialCharactersCurrency,
    SpecialCharactersEssentials,
    SpecialCharactersLatin,
    SpecialCharactersMathematical,
    SpecialCharactersText,
    Strikethrough,
    Subscript,
    Superscript,
    Table,
    TableCaption,
    TableCellProperties,
    TableColumnResize,
    TableProperties,
    TableToolbar,
    TextTransformation,
    TodoList,
    Underline,
  } = cloud.CKEditor
  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader>
            <strong>Add Notification</strong>
          </CCardHeader>
          <CCardBody>
            <p className="text-body-secondary small">Add Notification Details</p>
            <CForm className="row g-3">
              <CCol md={6}>
                <CFormLabel htmlFor="dateAdded">Date Added</CFormLabel>
                <CFormInput type="date" id="dateAdded" />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="validDate">Valid Upto date</CFormLabel>
                <CFormInput type="date" id="validDate" />
              </CCol>
              <CCol md={12}>
                <CFormLabel htmlFor="heading">Heading</CFormLabel>
                <CFormInput type="text" id="heading" />
              </CCol>
              <CCol md={12}>
                <CFormLabel htmlFor="heading">Content</CFormLabel>
                <CKEditor
                  editor={ClassicEditor}
                  data={'<p>Hello world!</p>'}
                  config={{
                    toolbar: {
                      items: [
                        'findAndReplace',
                        '|',
                        'heading',
                        '|',
                        'fontSize',
                        'fontFamily',
                        'fontColor',
                        'fontBackgroundColor',
                        '|',
                        'bold',
                        'italic',
                        'underline',
                        'strikethrough',
                        'subscript',
                        'superscript',
                        'code',
                        'removeFormat',
                        '|',
                        'emoji',
                        'specialCharacters',
                        'link',
                        'insertImage',
                        'mediaEmbed',
                        'insertTable',
                        'highlight',
                        'blockQuote',
                        '|',
                        'bulletedList',
                        'numberedList',
                        'todoList',
                        'outdent',
                        'indent',
                      ],
                      shouldNotGroupWhenFull: false,
                    },
                    plugins: [
                      Autoformat,
                      AutoImage,
                      Autosave,
                      BlockQuote,
                      Bold,
                      Code,
                      Emoji,
                      Essentials,
                      FindAndReplace,
                      FontBackgroundColor,
                      FontColor,
                      FontFamily,
                      FontSize,
                      Heading,
                      Highlight,
                      ImageBlock,
                      ImageCaption,
                      ImageEditing,
                      ImageInline,
                      ImageInsert,
                      ImageInsertViaUrl,
                      ImageResize,
                      ImageStyle,
                      ImageTextAlternative,
                      ImageToolbar,
                      ImageUpload,
                      ImageUtils,
                      Indent,
                      IndentBlock,
                      Italic,
                      Link,
                      LinkImage,
                      List,
                      ListProperties,
                      Markdown,
                      MediaEmbed,
                      Mention,
                      Paragraph,
                      PasteFromOffice,
                      RemoveFormat,
                      SimpleUploadAdapter,
                      SpecialCharacters,
                      SpecialCharactersArrows,
                      SpecialCharactersCurrency,
                      SpecialCharactersEssentials,
                      SpecialCharactersLatin,
                      SpecialCharactersMathematical,
                      SpecialCharactersText,
                      Strikethrough,
                      Subscript,
                      Superscript,
                      Table,
                      TableCaption,
                      TableCellProperties,
                      TableColumnResize,
                      TableProperties,
                      TableToolbar,
                      TextTransformation,
                      TodoList,
                      Underline,
                    ],
                    fontFamily: {
                      supportAllValues: true,
                    },
                    fontSize: {
                      options: [10, 12, 14, 'default', 12, 14, 20],
                      supportAllValues: true,
                    },
                    heading: {
                      options: [
                        {
                          model: 'paragraph',
                          title: 'Paragraph',
                          class: 'ck-heading_paragraph',
                        },
                        {
                          model: 'heading1',
                          view: 'h1',
                          title: 'Heading 1',
                          class: 'ck-heading_heading1',
                        },
                        {
                          model: 'heading2',
                          view: 'h2',
                          title: 'Heading 2',
                          class: 'ck-heading_heading2',
                        },
                        {
                          model: 'heading3',
                          view: 'h3',
                          title: 'Heading 3',
                          class: 'ck-heading_heading3',
                        },
                        {
                          model: 'heading4',
                          view: 'h4',
                          title: 'Heading 4',
                          class: 'ck-heading_heading4',
                        },
                        {
                          model: 'heading5',
                          view: 'h5',
                          title: 'Heading 5',
                          class: 'ck-heading_heading5',
                        },
                        {
                          model: 'heading6',
                          view: 'h6',
                          title: 'Heading 6',
                          class: 'ck-heading_heading6',
                        },
                      ],
                    },
                    fontColor: {
                      colors: [
                        {
                          color: 'hsl(0, 0%, 0%)',
                          label: 'Black',
                        },
                        {
                          color: 'hsl(0, 0%, 30%)',
                          label: 'Dim grey',
                        },
                        {
                          color: 'hsl(0, 0%, 60%)',
                          label: 'Grey',
                        },
                        {
                          color: 'hsl(0, 0%, 90%)',
                          label: 'Light grey',
                        },
                        {
                          color: 'hsl(0, 0%, 100%)',
                          label: 'White',
                          hasBorder: true,
                        },
                      ],
                    },
                    image: {
                      toolbar: [
                        'toggleImageCaption',
                        'imageTextAlternative',
                        '|',
                        'imageStyle:inline',
                        'imageStyle:wrapText',
                        'imageStyle:breakText',
                        '|',
                        'resizeImage',
                      ],
                    },
                    initialData: '<h6>Add your content here...</h6>',
                    licenseKey:
                      'eyJhbGciOiJFUzI1NiJ9.eyJleHAiOjE3NzA4NTQzOTksImp0aSI6IjVhM2JjNWUwLTJmZDAtNGMxYy04OWVkLWEyYWZhYzM5MTc5OSIsInVzYWdlRW5kcG9pbnQiOiJodHRwczovL3Byb3h5LWV2ZW50LmNrZWRpdG9yLmNvbSIsImRpc3RyaWJ1dGlvbkNoYW5uZWwiOlsiY2xvdWQiLCJkcnVwYWwiXSwiZmVhdHVyZXMiOlsiRFJVUCJdLCJ2YyI6Ijg3ZWY0YjdiIn0.lxAwWdZUtU0X6Iecme1KpM3t1WwOwVIQ79uy1n53tMjsbxJkr49O-R6aeXaFZdNZPGdsnq6htEzDe4vFLIlo3Q',
                    link: {
                      addTargetToExternalLinks: true,
                      defaultProtocol: 'https://',
                      decorators: {
                        toggleDownloadable: {
                          mode: 'manual',
                          label: 'Downloadable',
                          attributes: {
                            download: 'file',
                          },
                        },
                      },
                    },
                    list: {
                      properties: {
                        styles: true,
                        startIndex: true,
                        reversed: true,
                      },
                    },
                    mention: {
                      feeds: [
                        {
                          marker: '@',
                          feed: [
                            /* See: https://ckeditor.com/docs/ckeditor5/latest/features/mentions.html */
                          ],
                        },
                      ],
                    },
                    placeholder: 'Type or paste your content here!',
                    table: {
                      contentToolbar: [
                        'tableColumn',
                        'tableRow',
                        'mergeTableCells',
                        'tableProperties',
                        'tableCellProperties',
                      ],
                    },
                  }}
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="class">Status</CFormLabel>
                <CFormSelect id="class">
                  <option>Activate</option>
                  <option>Deactivate</option>
                </CFormSelect>
              </CCol>
              <div className="mb-3">
                <CFormLabel htmlFor="formFile">Notification Photo</CFormLabel>
                <CFormInput type="file" id="notificationPhoto" />
              </div>
              <CCol xs={12}>
                <CButton color="primary" type="submit">
                  Add Notification
                </CButton>
              </CCol>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default AddNotification
