import './App.css'
import { useAppStore } from '@/app/store'
import Layout from './components/Layout'
import { EBNFEditor } from '@/components/editor/ebnf-editor'
import { DSLEditorPanel } from '@/components/editor/dsl-editor-panel'
import { RailroadPanel } from '@/components/railroad-panel'
import { ResizablePanel, ResizablePanelGroup, ResizableHandle } from '@/components/ui/resizable'

function App() {
  const {
    showReferencePanel,
    showSecondEditorPanel,
    showParseTreePanel,
    showRailroadPanel,
  } = useAppStore()

  const showRightPanel = showSecondEditorPanel || showParseTreePanel || showRailroadPanel


  return (
    <Layout>
      <main className="flex flex-1 flex-row">
        <ResizablePanelGroup orientation="vertical" className="flex-1">
          <ResizablePanel minSize={200}>
            <ResizablePanelGroup orientation="horizontal" className="flex-1">
              <ResizablePanel minSize={300}>
                <EBNFEditor/>
              </ResizablePanel>

              {showRightPanel && (
                <>
                  <ResizableHandle withHandle className="z-10" />
                  <ResizablePanel minSize={350}>
                    <ResizablePanelGroup orientation="vertical" className="flex-1">

                      {showSecondEditorPanel && (
                        <>
                          <ResizablePanel minSize={100}>
                            <DSLEditorPanel />
                          </ResizablePanel>
                          <ResizableHandle />
                        </>
                      )}

                      {showParseTreePanel && (
                        <>
                          <ResizablePanel minSize={100}>
                            {/* ParseTreePanel - not yet implemented */}
                            <></>
                          </ResizablePanel>
                          <ResizableHandle />
                        </>
                      )}

                      {showRailroadPanel && (
                        <ResizablePanel minSize={100}>
                          <RailroadPanel />
                        </ResizablePanel>
                      )}

                    </ResizablePanelGroup>
                  </ResizablePanel>
                </>
              )}
            </ResizablePanelGroup>
          </ResizablePanel>

          {showReferencePanel && (
            <>
              <ResizableHandle />
              <ResizablePanel minSize={200} className="flex">
                {/* ReferencePanel - not yet implemented */}
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </main>
    </Layout>
  )
}

export default App