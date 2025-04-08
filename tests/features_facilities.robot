*** Settings ***
Library    SeleniumLibrary

*** Variables ***
${URL}     http://localhost:3000/admin/features-facilities
${FEATURE_NAME}  Test Feature Name`
*** Test Cases ***
Access Features and Facilities Data on Service Page
    Open Browser    ${URL}    Chrome
    Maximize Browser Window

    # Kiểm tra tiêu đề trang
    Wait Until Page Contains    FEATURES & FACILITES    timeout=5s

    Page Should Contain Element    xpath=//h3[contains(text(),'FEATURES & FACILITES')]
    
    Wait Until Page Contains    Features    timeout=5s
    Wait Until Page Contains    Facilities    timeout=5s
    Close Browser
Add Features Data on Service Page
    Open Browser    ${URL}    Chrome
    Maximize Browser Window

    # Mở modal thêm mới
    Click Button    xpath=//button[@data-bs-target='#feature-s']
    Wait Until Element Is Visible    id:feature-s
    # Nhập dữ liệu vào form
    Input Text    xpath://input[@name='feature_name']    Test Feature Name

    # Gửi form
    Click Button    xpath=//button[contains(., 'Submit')]

    # Kiểm tra dữ liệu đã được thêm thành công
    Close Browser
Add Facilities Data on Service Page
    Open Browser    ${URL}    Chrome
    Maximize Browser Window

    # Mở modal thêm mới
    Click Button    xpath=//button[@data-bs-target='#facility-s']
    Wait Until Element Is Visible    id:facility-s
    # Nhập dữ liệu vào form
    Input Text    xpath://input[@name='feature_name']    Test Feature Name
    Input Text    xpath://input[@name='facility_icon']    Test Feature Name
    Input Text    xpath://input[@name='facility_desc']    Test Feature Name

    # Gửi form
    Click Button    xpath=//button[contains(., 'Submit')]

    # Kiểm tra dữ liệu đã được thêm thành công
    Close Browser
Delete Features Data on Service Page
    Open Browser    ${URL}    ${BROWSER}
    Maximize Browser Window

    # Verify that the feature is already added and visible on the page
    Wait Until Page Contains    ${FEATURE_NAME}    timeout=5s

    # Click the Delete button for the feature named 'Test Feature Name'
    Click Button    xpath=//p[contains(text(), '${FEATURE_NAME}')]/ancestor::div[contains(@class, 'card')]/div/form/button

    # Handle the confirm/delete alert
    Handle Alert    ACCEPT

    # Wait for the page to reload and reflect the deletion
    Wait Until Page Contains    Features & Facilities    timeout=5s

    # Verify the feature is deleted and no longer visible on the page
    Page Should Not Contain    ${FEATURE_NAME}

    Close Browser