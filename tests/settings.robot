*** Settings ***
Library    SeleniumLibrary

*** Variables ***
${URL}     http://localhost:3000/admin/settings  # hoặc localhost/admin/settings nếu bạn đang chạy project local
${BROWSER}           Chrome

*** Test Cases ***
Access Admin Settings Page
    Open Browser    ${URL}   Chrome
    Wait Until Page Contains    General Settings
    Element Should Be Visible    xpath://button[contains(.,'Edit')]
    Close Browser

Verify Admin Settings Page Loads Successfully
    Open Browser    ${URL}    Chrome
    Maximize Browser Window
    Wait Until Page Contains Element    xpath://h5[contains(text(),'General Settings')]
    Page Should Contain Element         xpath://p[@id="site_title"]
    Page Should Contain Element         xpath://p[@id="site_about"]
    Close Browser

Update Site Title And About Successfully
    Open Browser    ${URL}    Chrome
    Maximize Browser Window

    # Open General Settings modal
    Click Button    xpath://button[@data-bs-target='#general-s']
    Wait Until Element Is Visible    id:general-s

    # Fill and submit form
    Input Text    xpath://input[@name="site_title"]    LETMECOOK
    Input Text    xpath://textarea[@name="site_about"]    Test about page
    Click Button    xpath=//button[contains(., 'Submit')]

    # Wait for redirect and updated content
    Wait Until Page Contains    LETMECOOK
    Page Should Contain    Test about page

    Close Browser

Update Contact Information Successfully
    Open Browser    ${URL}    Chrome
    Maximize Browser Window

    Click Button    xpath://button[@data-bs-target='#contacts-s']
    Wait Until Element Is Visible    xpath://input[@name='address']

    Input Text    xpath://input[@name='address']    123 Robot Street
    Input Text    xpath://input[@name='gmap']    https://maps.example.com
    Input Text    xpath://input[@name='phone']    +84999999999
    Input Text    xpath://input[@name='email']    robot@test.com
    Input Text    xpath://input[@name='iframe']    https://iframe.example.com
    Click Button    xpath=//button[contains(., 'Submit')]

    Wait Until Page Contains    Contacts Settings
    Page Should Contain    123 Robot Street
    Page Should Contain    https://maps.example.com
    Page Should Contain    +84999999999
    Page Should Contain    robot@test.com
    Page Should Contain    https://iframe.example.com
    
    Close Browser
Add Management Team Member Successfully
    Open Browser    ${URL}    ${BROWSER}
    Maximize Browser Window

    Click Button    xpath://button[@data-bs-target='#team-s']
    Wait Until Element Is Visible    id=team-s    timeout=5s

    Input Text    xpath://input[@name='name']    Nguyen Van A

    Choose File    id=member_picture_inp    ${TEAM_MEMBER_IMAGE}

    Click Button    xpath=//div[@id='team-s']//button[normalize-space()='Submit']

    Wait Until Page Contains    Management Team    timeout=5s

    Page Should Contain    ${TEAM_MEMBER_NAME}

    Close Browser
Delete Management Team Member Successfully
    Open Browser    ${URL}    ${BROWSER}
    Maximize Browser Window

    # Kiểm tra thành viên tồn tại trước khi xóa
    Wait Until Page Contains    ${MEMBER_NAME}    timeout=5s

    # Click nút Delete tương ứng với tên thành viên
    Click Button    xpath=//p[contains(text(), '${MEMBER_NAME}')]/ancestor::div[contains(@class, 'card')]/div/form/button

    # Xác nhận trong alert/confirm popup
    Handle Alert    ACCEPT

    # Đợi trang reload
    Wait Until Page Contains    Management Team    timeout=5s

    # Kiểm tra rằng tên thành viên đã biến mất
    Page Should Not Contain    ${MEMBER_NAME}

    Close Browser

