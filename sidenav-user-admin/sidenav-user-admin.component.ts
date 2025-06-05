import { NgClass } from '@angular/common';
import { Component, EventEmitter, inject, Input, Output } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { Router, NavigationEnd, RouterLink } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { IconDirective } from '@shared/directives/icon.directive';
import { IconEnum } from '@shared/enums/icon.enum';
import { ISidebar } from '@shared/interfaces/sidebar.interface';
import { ImagePipe } from '@shared/pipes/image.pipe';
import { DirectionType } from '@shared/types/direction.type';
import { isInMobile } from '@shared/utils/utils';
import { filter, first } from 'rxjs';

@Component({
  selector: 'app-sidenav-user-admin',
  standalone: true,
  imports: [NgClass, IconDirective, TranslatePipe, MatInputModule, RouterLink, ImagePipe],
  templateUrl: './sidenav-user-admin.component.html',
  styleUrl: './sidenav-user-admin.component.scss'
})
export class SidenavUserAdminComponent {
  @Input({ required: true }) sidebarClose: boolean = false;
  @Input({ required: true }) direction: DirectionType;
  @Output() close: EventEmitter<boolean> = new EventEmitter();
  translateService: TranslateService = inject(TranslateService);
  iconEnum = IconEnum;
  isMobile: boolean = false;
  searchListRoute: ISidebar[] = [];
  finalSearchList: ISidebar[] = [];

  list: ISidebar[] = [
    {
      icon: this.iconEnum.home,
      name: this.translateService.instant('sidebar.HOME'),
      path: "panel",
      child: [],
      roles: [],
      isActive: false
    },
    {
      icon: this.iconEnum.laptop,
      name: this.translateService.instant('sidebar.BASIC_INFORMATION'),
      path: "",
      child: [
        {
          icon: this.iconEnum.setting,
          name: this.translateService.instant('sidebar.BASIC_SETTINGS'),
          path: "",
          child: [
            {
              icon: this.iconEnum.company,
              name: this.translateService.instant('sidebar.COMPANY_PROFILE'),
              path: "panel/basic-information/basic-setting/company-profile",
              child: [],
              roles: [],
              isActive: false
            },
            {
              icon: this.iconEnum.cashBank,
              name: this.translateService.instant('sidebar.REFERENCE_CURRENCY'),
              path: "panel/basic-information/basic-setting/reference-currency",
              child: [],
              roles: [],
              isActive: false
            },
            {
              icon: this.iconEnum.calendarShare,
              name: this.translateService.instant('sidebar.FINANCIAL_PERIOD'),
              path: "panel/basic-information/basic-setting/financial-period",
              child: [],
              roles: [],
              isActive: false
            },
            {
              icon: this.iconEnum.dashboard,
              name: this.translateService.instant('sidebar.CHARACTER_NUMBERS_DETAIL'),
              path: "panel/basic-information/basic-setting/character-numbers-detail",
              child: [],
              roles: [],
              isActive: false
            },
          ],
          roles: [],
          isActive: false
        },
        {
          icon: this.iconEnum.cash,
          name: this.translateService.instant('sidebar.CURRENCY_MANAGEMENT'),
          path: "",
          child: [
            {
              icon: this.iconEnum.cash,
              name: this.translateService.instant('sidebar.CURRENCY_LIST'),
              path: "panel/basic-information/currency-management/currency-list",
              child: [],
              roles: [],
              isActive: false
            },
            {
              icon: this.iconEnum.switchHorizontal,
              name: this.translateService.instant('sidebar.CURRENCY_CONVERSION_RATE'),
              path: "panel/basic-information/currency-management/currency-exchange-rate",
              child: [],
              roles: [],
              isActive: false
            },
          ],
          roles: [],
          isActive: false
        },
        {
          icon: this.iconEnum.users,
          name: this.translateService.instant('sidebar.USERS_MANAGEMENT'),
          path: "",
          child: [
            {
              icon: this.iconEnum.usersGroup,
              name: this.translateService.instant('sidebar.PERMISSION_GROUP'),
              path: "panel/basic-information/users-management/permission-group",
              child: [],
              roles: [],
              isActive: false
            },
            {
              icon: this.iconEnum.users,
              name: this.translateService.instant('sidebar.USERS_LIST'),
              path: "panel/basic-information/users-management/users",
              child: [],
              roles: [],
              isActive: false
            }
          ],
          roles: [],
          isActive: false
        },
        {
          icon: this.iconEnum.mapPin,
          name: this.translateService.instant('sidebar.REGION_MANAGEMENT'),
          path: "",
          child: [
            {
              icon: this.iconEnum.worldPin,
              name: this.translateService.instant('sidebar.COUNTRY'),
              path: "panel/basic-information/region-management/country",
              child: [],
              roles: [],
              isActive: false
            },
            {
              icon: this.iconEnum.map2,
              name: this.translateService.instant('sidebar.PROVINCE'),
              path: "panel/basic-information/region-management/province",
              child: [],
              roles: [],
              isActive: false
            },
            {
              icon: this.iconEnum.buildingEstate,
              name: this.translateService.instant('sidebar.CITY'),
              path: "panel/basic-information/region-management/city",
              child: [],
              roles: [],
              isActive: false
            }
          ],
          roles: [],
          isActive: false
        },
        {
          icon: this.iconEnum.bank,
          name: this.translateService.instant('sidebar.BANK_MANAGEMENT'),
          path: "panel/basic-information/bank-management/bank",
          child: [],
          roles: [],
          isActive: false
        },
        // {
        // icon: this.iconEnum.buildingBank,
        //   name: this.translateService.instant('sidebar.BANKING_BRANCH_MANAGEMENT'),
        //   path: "",
        //   child: [
        //     // {
        //     //   icon: this.iconEnum.bankBranch,
        //     //   name: this.translateService.instant('sidebar.BANK_BRANCH'),
        //     //   path: "panel/basic-information/bank-management/bank-branch",
        //     //   child: [],
        //     //   roles: [],
        //     //   isActive: false
        //     // },
        //   ],
        //   roles: [],
        //   isActive: false
        // },
        {
          icon: this.iconEnum.listDetails,
          name: this.translateService.instant('sidebar.DEFINITION_OF_BASIC_DETAILED'),
          path: "",
          child: [
            {
              icon: this.iconEnum.floatNone,
              name: this.translateService.instant('sidebar.DETAILED_TYPE'),
              path: "panel/basic-information/detailed-basic/detailed-type",
              child: [],
              roles: [],
              isActive: false
            },
            {
              icon: this.iconEnum.userScan,
              name: this.translateService.instant('sidebar.PERSON'),
              path: "panel/basic-information/detailed-basic/personal-details",
              child: [],
              roles: [],
              isActive: false
            },
            {
              icon: this.iconEnum.company2,
              name: this.translateService.instant('sidebar.COMPANY'),
              path: "panel/basic-information/detailed-basic/company-details",
              child: [],
              roles: [],
              isActive: false
            },
            {
              icon: this.iconEnum.moneyBag,
              name: this.translateService.instant('sidebar.COST_CENTER'),
              path: "panel/basic-information/detailed-basic/cost-centers",
              child: [],
              roles: [],
              isActive: false
            },
            {
              icon: this.iconEnum.creditCard,
              name: this.translateService.instant('sidebar.BANK_ACCOUNT'),
              path: "panel/basic-information/detailed-basic/bank-account",
              child: [],
              roles: [],
              isActive: false
            },
            {
              icon: this.iconEnum.cashRegister,
              name: this.translateService.instant('sidebar.CARD_READER'),
              path: "panel/basic-information/detailed-basic/pose-accounting",
              child: [],
              roles: [],
              isActive: false
            },
            {
              icon: this.iconEnum.clipboardList,
              name: this.translateService.instant('sidebar.PROJECT'),
              path: "panel/basic-information/detailed-basic/project",
              child: [],
              roles: [],
              isActive: false
            },
            {
              icon: this.iconEnum.heartHandshake,
              name: this.translateService.instant('sidebar.CONTRACT'),
              path: "panel/basic-information/detailed-basic/contract",
              child: [],
              roles: [],
              isActive: false
            },
            {
              icon: this.iconEnum.truckloading,
              name: this.translateService.instant('sidebar.ORDER'),
              path: "panel/basic-information/detailed-basic/orders",
              child: [],
              roles: [],
              isActive: false
            },
            {
              icon: this.iconEnum.truck,
              name: this.translateService.instant('sidebar.MACHINERY'),
              path: "panel/basic-information/detailed-basic/machinery",
              child: [],
              roles: [],
              isActive: false
            },
            {
              icon: this.iconEnum.building,
              name: this.translateService.instant('sidebar.BUILDING_UNIT'),
              path: "panel/basic-information/detailed-basic/building-unit",
              child: [],
              roles: [],
              isActive: false
            },
            {
              icon: this.iconEnum.list,
              name: this.translateService.instant('sidebar.OTHER_DETAILS'),
              path: "panel/basic-information/detailed-basic/other",
              child: [],
              roles: [],
              isActive: false
            },
          ],
          roles: [],
          isActive: false
        },
      ],
      roles: [],
      isActive: false
    },

    {
      icon: this.iconEnum.calculator,
      name: this.translateService.instant('sidebar.ACCOUNTING'),
      path: "",
      child: [
        {
          icon: this.iconEnum.settingBolt,
          name: this.translateService.instant('sidebar.ACCOUNTING_SETTINGS'),
          path: "panel/accounting/accounting-setting",
          child: [],
          roles: [],
          isActive: false
        },
        {
          icon: this.iconEnum.folderOpen,
          name: this.translateService.instant('sidebar.ACCOUNTS'),
          path: "",
          child: [
            {
              icon: this.iconEnum.listTree,
              name: this.translateService.instant('sidebar.ACCOUNTS_TREE'),
              path: "panel/accounting/accounts/accounts-tree",
              child: [],
              roles: [],
              isActive: false
            },
          ],
          roles: [],
          isActive: false
        },
      ],
      roles: [],
      isActive: false
    },
  ];
  constructor(
    private router: Router
  ) {
    this.isMobile = isInMobile();

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.list.forEach((firstLevel: ISidebar) => {
        if (firstLevel.path == event.urlAfterRedirects.slice(1).split('?')[0]) {
          firstLevel.isActive = true;
        }
        firstLevel.child.forEach(secondLevel => {
          secondLevel.isActive = false;
          if (secondLevel.path == event.urlAfterRedirects.slice(1).split('?')[0]) {
            firstLevel.isActive = true;
            secondLevel.isActive = true;
          }
          secondLevel.child.forEach(thirdLevel => {
            if (thirdLevel.path == event.urlAfterRedirects.slice(1).split('?')[0]) {
              firstLevel.isActive = true;
              secondLevel.isActive = true;
              thirdLevel.isActive = true;
            }
          });
        });
      });
    });

    this.getRouteList(this.list)

  }

  getRouteList(list: ISidebar[]) {
    list.forEach(menu => {
      if (menu.path.trim() !== '') {
        this.searchListRoute.push(menu);
      } else {
        if (menu.child.length) {
          this.getRouteList(menu.child);
        }
      }
    });
  }

  goTo(item: ISidebar, child: ISidebar | null = null, child2: ISidebar | null = null) {
    this.list.forEach((firstLevel: ISidebar) => {
      if (firstLevel.name == item.name) {
        firstLevel.isActive = (item.isActive && child == null && child2 == null) ? false : true;
      } else {
        firstLevel.isActive = false;
      }
      if (firstLevel.child.length > 0) {
        firstLevel.child.forEach((secondLevel: ISidebar) => {
          if (secondLevel.name == child?.name) {
            secondLevel.isActive = (child?.isActive && child2 == null) ? false : true;
          } else {
            secondLevel.isActive = false;
          }
          if (secondLevel.child.length > 0) {
            secondLevel.child.forEach((thirdLevel: ISidebar) => {
              if (thirdLevel.name == child2?.name) {
                thirdLevel.isActive = true;
              } else {
                thirdLevel.isActive = false;
              }
            })
          }
        })
      }
    });
    let path = item.path !== '' ? item.path : child?.path ? child?.path : child2?.path;
    if (path) {
      if (isInMobile()) {
        this.closeSidebar();
      }
      this.router.navigate([path]);
    }
  }

  closeSidebar() {
    this.close.emit(this.sidebarClose);
  }

  searchSidebar(value: string) {
    if (value.trim() !== '')
      this.finalSearchList = this.searchListRoute.filter(item => item.name.includes(value.trim()));
    else
      this.finalSearchList = [];
  }

}
